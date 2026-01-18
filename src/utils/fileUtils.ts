/**
 * File utilities for safe I/O operations and path resolution
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Get the workspace folder path, or throw if none exists
 */
export function getWorkspaceFolder(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    throw new Error('No workspace folder open');
  }
  return workspaceFolders[0].uri.fsPath;
}

/**
 * Resolve a path relative to the workspace folder
 */
export function resolveWorkspacePath(relativePath: string): string {
  const workspacePath = getWorkspaceFolder();
  return path.resolve(workspacePath, relativePath);
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Check if a directory exists
 */
export function directoryExists(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Read a file safely, returning undefined on error
 */
export function readFileSafe(filePath: string): string | undefined {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file ${filePath}:`, error);
    return undefined;
  }
}

/**
 * Write a file safely, creating directories if needed
 */
export function writeFileSafe(filePath: string, content: string): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error);
    return false;
  }
}

/**
 * Read a JSON file safely
 */
export function readJsonFile<T>(filePath: string): T | undefined {
  const content = readFileSafe(filePath);
  if (!content) {
    return undefined;
  }
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Failed to parse JSON file ${filePath}:`, error);
    return undefined;
  }
}

/**
 * Write a JSON file safely with formatting
 */
export function writeJsonFile(filePath: string, data: unknown): boolean {
  try {
    const content = JSON.stringify(data, null, 2);
    return writeFileSafe(filePath, content);
  } catch (error) {
    console.error(`Failed to write JSON file ${filePath}:`, error);
    return false;
  }
}

/**
 * List files in a directory
 */
export function listFiles(dirPath: string, extension?: string): string[] {
  try {
    if (!directoryExists(dirPath)) {
      return [];
    }
    const files = fs.readdirSync(dirPath);
    if (extension) {
      return files.filter(f => f.endsWith(extension)).map(f => path.join(dirPath, f));
    }
    return files.map(f => path.join(dirPath, f));
  } catch (error) {
    console.error(`Failed to list files in ${dirPath}:`, error);
    return [];
  }
}
