/**
 * Tree view provider for agent schedules
 */

import * as vscode from 'vscode';
import { Schedule } from '../types';
import { StorageManager } from '../storage/storageManager';
import { SchedulerService } from '../scheduler/schedulerService';

export class ScheduleTreeItem extends vscode.TreeItem {
  constructor(
    public readonly schedule: Schedule,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    private schedulerService: SchedulerService
  ) {
    super(schedule.name, collapsibleState);

    this.tooltip = this.getTooltip();
    this.description = this.getDescription();
    this.contextValue = schedule.enabled ? 'schedule-enabled' : 'schedule-disabled';
    this.iconPath = this.getIcon();
  }

  private getIcon(): vscode.ThemeIcon {
    if (this.schedule.enabled) {
      return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.green'));
    }
    return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.grey'));
  }

  private getDescription(): string {
    const parts: string[] = [];

    // Add target type
    if (this.schedule.targetType === 'command' && this.schedule.commandRef) {
      parts.push(`📋 ${this.schedule.commandRef.commandId}`);
    } else {
      parts.push('💬 Prompt');
    }

    // Add next run time
    const nextRun = this.schedulerService.getNextRunTime(this.schedule.id);
    if (nextRun) {
      parts.push(`Next: ${nextRun.toLocaleString()}`);
    }

    return parts.join(' • ');
  }

  private getTooltip(): string {
    const lines: string[] = [
      `Schedule: ${this.schedule.name}`,
      `Status: ${this.schedule.enabled ? 'Enabled' : 'Disabled'}`,
      `Type: ${this.schedule.targetType === 'command' ? 'Command' : 'Prompt'}`,
      `Cron: ${this.schedule.cron}`,
      `Mode: ${this.schedule.executionMode}`
    ];

    if (this.schedule.targetType === 'command' && this.schedule.commandRef) {
      lines.push(`Command: ${this.schedule.commandRef.commandId}`);
      lines.push(`File: ${this.schedule.commandRef.filePath}`);
    }

    const nextRun = this.schedulerService.getNextRunTime(this.schedule.id);
    if (nextRun) {
      lines.push(`Next Run: ${nextRun.toLocaleString()}`);
    }

    return lines.join('\n');
  }
}

export class ScheduleTreeView implements vscode.TreeDataProvider<ScheduleTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ScheduleTreeItem | undefined | null | void> = new vscode.EventEmitter<ScheduleTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ScheduleTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(
    private storageManager: StorageManager,
    private schedulerService: SchedulerService
  ) {
    // Listen for changes in scheduler
    this.schedulerService.onDidChange(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ScheduleTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ScheduleTreeItem): Promise<ScheduleTreeItem[]> {
    if (element) {
      return []; // No children for now
    }

    const schedules = await this.storageManager.loadSchedules();
    return schedules.map(schedule => 
      new ScheduleTreeItem(schedule, vscode.TreeItemCollapsibleState.None, this.schedulerService)
    );
  }

  /**
   * Get schedule from tree item
   */
  async getScheduleFromItem(item: ScheduleTreeItem): Promise<Schedule | undefined> {
    const schedules = await this.storageManager.loadSchedules();
    return schedules.find(s => s.id === item.schedule.id);
  }
}
