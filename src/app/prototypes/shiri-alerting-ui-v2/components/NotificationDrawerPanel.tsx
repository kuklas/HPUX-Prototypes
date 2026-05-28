import * as React from 'react';
import {
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerHeader,
  NotificationDrawerList,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import type { AlertData } from '../data/types';

const AiTroubleshootIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M7 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    <path d="M4 9l.75 1.5L6.25 11.25l-1.5.75L4 13.5l-.75-1.5L1.75 11.25l1.5-.75L4 9z" />
    <path d="M25.4 5.1a5.5 5.5 0 00-6.7 1.2l-.2.2a5.5 5.5 0 00-.6 6.5L8.4 22.5a2.8 2.8 0 103.9 3.9l9.5-9.5a5.5 5.5 0 006.5-.6l.2-.2a5.5 5.5 0 001.2-6.7l-3.2 3.2-2.5-.6-.6-2.5 3.2-3.2zM10.3 25.7a1.2 1.2 0 11-1.7-1.7 1.2 1.2 0 011.7 1.7z" />
  </svg>
);

export interface NotificationDrawerPanelProps {
  alerts: AlertData[];
  onClose: () => void;
  onAlertClick: (alert: AlertData) => void;
  onInvestigateWithAi: (alert: AlertData) => void;
}

export const NotificationDrawerPanel: React.FC<NotificationDrawerPanelProps> = ({
  alerts,
  onClose,
  onAlertClick,
  onInvestigateWithAi,
}) => {
  const [openKebabId, setOpenKebabId] = React.useState<string | null>(null);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());

  const recentAlerts = React.useMemo(() => {
    return [...alerts]
      .filter(a => a.status === 'firing')
      .sort((a, b) => b.lastFiredTimestamp.getTime() - a.lastFiredTimestamp.getTime())
      .slice(0, 8);
  }, [alerts]);

  const unreadCount = recentAlerts.filter(a => !readIds.has(a.id)).length;

  const getSeverityVariant = (severity: string): 'danger' | 'warning' | 'info' | 'custom' => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'custom';
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  const handleAlertClick = (alert: AlertData) => {
    setReadIds(prev => new Set(prev).add(alert.id));
    onAlertClick(alert);
  };

  return (
    <NotificationDrawer>
      <NotificationDrawerHeader
        title="Alerts"
        count={unreadCount}
        onClose={onClose}
      />
      <NotificationDrawerBody>
        <NotificationDrawerList>
          {recentAlerts.map((alert) => (
            <NotificationDrawerListItem
              key={alert.id}
              variant={getSeverityVariant(alert.severity)}
              isRead={readIds.has(alert.id)}
              onClick={() => handleAlertClick(alert)}
            >
              <NotificationDrawerListItemHeader
                title={alert.alertName}
                variant={getSeverityVariant(alert.severity)}
                srTitle={`${alert.severity} alert`}
              >
                <Dropdown
                  isOpen={openKebabId === alert.id}
                  onOpenChange={(open) => setOpenKebabId(open ? alert.id : null)}
                  popperProps={{ position: 'right' }}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      variant="plain"
                      onClick={(e) => { e.stopPropagation(); setOpenKebabId(openKebabId === alert.id ? null : alert.id); }}
                      isExpanded={openKebabId === alert.id}
                      aria-label="Notification actions"
                    >
                      <EllipsisVIcon />
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem
                      key="investigate-ai"
                      icon={<AiTroubleshootIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenKebabId(null);
                        setReadIds(prev => new Set(prev).add(alert.id));
                        onInvestigateWithAi(alert);
                      }}
                    >
                      Investigate with AI
                    </DropdownItem>
                    <DropdownItem
                      key="view-details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenKebabId(null);
                        handleAlertClick(alert);
                      }}
                    >
                      View alert details
                    </DropdownItem>
                    <DropdownItem
                      key="mark-read"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenKebabId(null);
                        setReadIds(prev => new Set(prev).add(alert.id));
                      }}
                    >
                      Mark as read
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </NotificationDrawerListItemHeader>
              <NotificationDrawerListItemBody timestamp={getTimeAgo(alert.lastFiredTimestamp)}>
                {alert.clusterName} &middot; {alert.namespace}
                {alert.summary && <> &mdash; {alert.summary.length > 80 ? alert.summary.slice(0, 80) + '...' : alert.summary}</>}
              </NotificationDrawerListItemBody>
            </NotificationDrawerListItem>
          ))}
        </NotificationDrawerList>
      </NotificationDrawerBody>
    </NotificationDrawer>
  );
};
