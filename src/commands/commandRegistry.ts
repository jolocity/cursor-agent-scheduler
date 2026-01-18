/**
 * Command registry for scanning and managing commands from ./.cursor/commands
 */

import * as vscode from 'vscode';
import { Command } from '../types';
import { resolveWorkspacePath, listFiles, directoryExists } from '../utils/fileUtils';
import { parseCommandFile } from '../utils/commandParser';

const COMMANDS_DIR = '.cursor/commands';

export class CommandRegistry implements vscode.Disposable {
  private commands: Map<string, Command> = new Map();
  private watcher: vscode.FileSystemWatcher | undefined;
  private onDidChangeEmitter = new vscode.EventEmitter<void>();
  public readonly onDidChange = this.onDidChangeEmitter.event;

  constructor() {
    this.reloadCommands();
    this.watchCommands();
  }

  /**
   * Reload all commands from the commands directory
   */
  reloadCommands(): void {
    this.commands.clear();
    const commandsDir = resolveWorkspacePath(COMMANDS_DIR);

    if (!directoryExists(commandsDir)) {
      console.log(`Commands directory does not exist: ${commandsDir}`);
      return;
    }

    // Find all command files
    const jsonFiles = listFiles(commandsDir, '.json');
    const yamlFiles = listFiles(commandsDir, '.yaml').concat(listFiles(commandsDir, '.yml'));
    const mdFiles = listFiles(commandsDir, '.md').concat(listFiles(commandsDir, '.markdown'));

    const allFiles = [...jsonFiles, ...yamlFiles, ...mdFiles];

    for (const filePath of allFiles) {
      const command = parseCommandFile(filePath);
      if (command) {
        const key = this.getCommandKey(command.filePath, command.id);
        this.commands.set(key, command);
      }
    }

    console.log(`Loaded ${this.commands.size} commands from ${commandsDir}`);
    this.onDidChangeEmitter.fire();
  }

  /**
   * Get a command by file path and ID
   */
  getCommand(filePath: string, commandId: string): Command | undefined {
    const key = this.getCommandKey(filePath, commandId);
    return this.commands.get(key);
  }

  /**
   * Get all commands
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands grouped by file
   */
  getCommandsByFile(): Map<string, Command[]> {
    const byFile = new Map<string, Command[]>();
    for (const command of this.commands.values()) {
      const fileCommands = byFile.get(command.filePath) || [];
      fileCommands.push(command);
      byFile.set(command.filePath, fileCommands);
    }
    return byFile;
  }

  /**
   * Get a unique key for a command
   */
  private getCommandKey(filePath: string, commandId: string): string {
    return `${filePath}::${commandId}`;
  }

  /**
   * Set up file watcher for commands directory
   */
  private watchCommands(): void {
    const commandsDir = resolveWorkspacePath(COMMANDS_DIR);
    const pattern = new vscode.RelativePattern(commandsDir, '**/*.{json,yaml,yml,md,markdown}');

    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);
    this.watcher.onDidCreate(() => {
      console.log('Command file created, reloading...');
      this.reloadCommands();
    });
    this.watcher.onDidChange(() => {
      console.log('Command file changed, reloading...');
      this.reloadCommands();
    });
    this.watcher.onDidDelete(() => {
      console.log('Command file deleted, reloading...');
      this.reloadCommands();
    });
  }

  dispose(): void {
    this.watcher?.dispose();
    this.onDidChangeEmitter.dispose();
  }
}
