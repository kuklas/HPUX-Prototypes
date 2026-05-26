import * as React from 'react';
import {
  Content,
  Title,
  Flex,
  FlexItem,
  Button,
  Label,
  Stack,
  StackItem,
  Icon,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  ExpandableSection,
  Checkbox,
  Divider,
} from '@patternfly/react-core';
import {
  ArrowLeftIcon,
  TimesIcon,
  EllipsisVIcon,
  ExclamationCircleIcon,
  InfoCircleIcon,
  DownloadIcon,
  CheckCircleIcon,
} from '@patternfly/react-icons';
import type { AlertData } from '../data/types';

const AiTroubleshootIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M7 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    <path d="M4 9l.75 1.5L6.25 11.25l-1.5.75L4 13.5l-.75-1.5L1.75 11.25l1.5-.75L4 9z" />
    <path d="M25.4 5.1a5.5 5.5 0 00-6.7 1.2l-.2.2a5.5 5.5 0 00-.6 6.5L8.4 22.5a2.8 2.8 0 103.9 3.9l9.5-9.5a5.5 5.5 0 006.5-.6l.2-.2a5.5 5.5 0 001.2-6.7l-3.2 3.2-2.5-.6-.6-2.5 3.2-3.2zM10.3 25.7a1.2 1.2 0 11-1.7-1.7 1.2 1.2 0 011.7 1.7z" />
  </svg>
);

const AiExperienceIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1.5l1.5 3.2L13 6l-3.5 1.3L8 10.5 6.5 7.3 3 6l3.5-1.3L8 1.5z" />
    <path d="M12.5 9l.75 1.6 1.75.65-1.75.65-.75 1.6-.75-1.6L10 11.25l1.75-.65L12.5 9z" opacity=".7" />
    <path d="M4 11l.5 1.1 1.2.45-1.2.45L4 14.1l-.5-1.1-1.2-.45 1.2-.45L4 11z" opacity=".5" />
  </svg>
);

export interface AiTroubleshootPanelProps {
  alert: AlertData;
  onBack: () => void;
  onClose: () => void;
}

interface ReasoningStep {
  timestamp: string;
  description: string;
  status: 'success' | 'info' | 'warning' | 'active';
}

const MOCK_REASONING_CHAIN_SMART: ReasoningStep[] = [
  { timestamp: '10:04', description: 'Detected DiskUsageCritical threshold breach (98.4% capacity reached).', status: 'warning' },
  { timestamp: '10:04:56', description: 'Queried system metrics: Isolated the anomaly to the /var partition.', status: 'success' },
  { timestamp: '10:04:58', description: 'Scanned running processes: Found nginx writing to disk at 85MB/s.', status: 'success' },
  { timestamp: '10:05:01', description: 'Inspected file system: Found /var/log/nginx/access.log sitting at 142GB.', status: 'success' },
  { timestamp: '10:05:09', description: 'Checked cron history: Discovered logrotate.service failed earlier today with status exit-code: 1 (Permission Denied).', status: 'info' },
  { timestamp: '10:05:14', description: 'Cross-correlated with deployment events: Security hardening playbook ran at 09:30 modifying /etc/logrotate.d/*.', status: 'success' },
  { timestamp: '10:05:21', description: 'Blast-radius assessment: 3 additional hosts share the same playbook config — at risk of similar failure.', status: 'warning' },
];

const MOCK_REASONING_CHAIN_FAST: ReasoningStep[] = [
  { timestamp: '10:04', description: 'Detected DiskUsageCritical threshold breach (98.4% capacity reached).', status: 'warning' },
  { timestamp: '10:04:12', description: 'Identified /var partition as primary contributor via df metrics.', status: 'success' },
  { timestamp: '10:04:18', description: 'Matched known pattern: large log file + failed logrotate service.', status: 'success' },
];

const MOCK_ANALYSIS_LOGS_SMART = `[10:04:00.123] INFO  Starting deep multi-signal analysis for alert DiskUsageCritical
[10:04:00.124] DEBUG Connecting to metrics store (prometheus-k8s.openshift-monitoring:9090)
[10:04:00.341] INFO  Query: node_filesystem_avail_bytes{mountpoint="/var"} / node_filesystem_size_bytes{mountpoint="/var"}
[10:04:00.587] INFO  Result: 1.6% available (threshold: 5%)
[10:04:56.002] INFO  Isolating anomaly: /var partition identified as root cause
[10:04:56.110] DEBUG Scanning process table for high disk I/O writers
[10:04:58.443] INFO  Found: nginx (PID 2847) writing 85MB/s to /var/log/nginx/access.log
[10:05:01.221] INFO  File inspection: /var/log/nginx/access.log size=142GB modified=2m ago
[10:05:01.445] DEBUG Checking systemd unit status for logrotate.service
[10:05:09.012] WARN  logrotate.service: exit-code 1 (Permission Denied) at 09:31:04 UTC
[10:05:14.556] INFO  Cross-referencing deployment/change events in 24h window
[10:05:14.801] INFO  Match: ansible-playbook security-hardening.yml executed at 09:30:02 UTC
[10:05:21.003] WARN  Blast-radius: 3 additional hosts share playbook config (prod-api-server-01,02,03)
[10:05:21.120] INFO  Analysis complete. Confidence: 94%`;

const MOCK_ANALYSIS_LOGS_FAST = `[10:04:00.123] INFO  Starting fast single-signal analysis for alert DiskUsageCritical
[10:04:00.124] DEBUG Connecting to metrics store (prometheus-k8s.openshift-monitoring:9090)
[10:04:00.341] INFO  Query: node_filesystem_avail_bytes{mountpoint="/var"}
[10:04:12.102] INFO  Identified /var as primary contributor (98.4% used)
[10:04:18.445] INFO  Pattern match: large log + failed logrotate (known pattern ID: DISK-003)
[10:04:18.501] INFO  Analysis complete. Confidence: 78%`;

const MOCK_ROOT_CAUSE = `Finding: The logrotate daemon failed to compress and cycle Nginx access logs due to a broken permission mask (0644 instead of 0640 expected by the system user) introduced during a routine security hardening script. Uncompressed active logs consumed the entire partition during peak afternoon traffic.`;

type InlinePart = string | { code: string };

interface RbacPermission {
  namespace: string;
  apiGroups: string[];
  resources: string[];
  verbs: string[];
  justification: string;
}

interface RemediationPlan {
  name: string;
  risk: 'Low' | 'Medium' | 'High';
  reversible: boolean;
  requiresRbac: boolean;
  rbacPermissions?: RbacPermission[];
  steps: { parts: InlinePart[] }[];
}

const MOCK_REMEDIATION_PLANS: RemediationPlan[] = [
  {
    name: 'Safe log rotation fix',
    risk: 'Low',
    reversible: true,
    requiresRbac: false,
    steps: [
      { parts: ['Safely archive and gzip ', { code: '/var/log/nginx/access.log' }, ' to a backup block storage mount (', { code: '/mnt/backup' }, ').'] },
      { parts: ['Correct the configuration permissions file at ', { code: '/etc/logrotate.d/nginx' }, '.'] },
      { parts: ['Execute a dry-run test of ', { code: 'logrotate -f /etc/logrotate.d/nginx' }, ' to ensure future stability.'] },
    ],
  },
  {
    name: 'Service restart with log cleanup',
    risk: 'Medium',
    reversible: true,
    requiresRbac: true,
    rbacPermissions: [
      {
        namespace: 'production',
        apiGroups: ['(core)'],
        resources: ['pods', 'services'],
        verbs: ['get', 'list', 'delete'],
        justification: 'Need to restart nginx pods and validate service endpoints',
      },
    ],
    steps: [
      { parts: ['Stop ', { code: 'nginx.service' }, ' gracefully to release file handles.'] },
      { parts: ['Truncate ', { code: '/var/log/nginx/access.log' }, ' in place and fix permissions.'] },
      { parts: ['Restart ', { code: 'nginx.service' }, ' and validate traffic is flowing.'] },
    ],
  },
  {
    name: 'Full partition reclaim',
    risk: 'High',
    reversible: false,
    requiresRbac: true,
    rbacPermissions: [
      {
        namespace: 'production',
        apiGroups: ['(core)', 'storage.k8s.io'],
        resources: ['persistentvolumeclaims', 'pods'],
        verbs: ['get', 'list', 'update', 'patch'],
        justification: 'Need to resize PVC and restart affected pods after partition resize',
      },
    ],
    steps: [
      { parts: ['Purge all log files older than 7 days from ', { code: '/var/log/nginx/' }, '.'] },
      { parts: ['Resize the ', { code: '/var' }, ' partition using LVM to add 50GB from unallocated pool.'] },
      { parts: ['Reconfigure logrotate with aggressive daily rotation and 5-day retention.'] },
    ],
  },
];

export const AiTroubleshootPanel: React.FC<AiTroubleshootPanelProps> = ({ alert, onBack, onClose }) => {
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);
  const [isReasoningExpanded, setIsReasoningExpanded] = React.useState(true);
  const [isRootCauseExpanded, setIsRootCauseExpanded] = React.useState(true);
  const [isRemediationExpanded, setIsRemediationExpanded] = React.useState(true);
  const [testState, setTestState] = React.useState<'idle' | 'testing' | 'tested'>('idle');
  const [analysisType, setAnalysisType] = React.useState<'smart' | 'fast'>('smart');
  const [isAnalysisDropdownOpen, setIsAnalysisDropdownOpen] = React.useState(false);
  const [isAnalysisRunning, setIsAnalysisRunning] = React.useState(false);
  const [isLogsExpanded, setIsLogsExpanded] = React.useState(false);
  const [selectedPlanIdx, setSelectedPlanIdx] = React.useState(0);

  const reasoningChain = analysisType === 'smart' ? MOCK_REASONING_CHAIN_SMART : MOCK_REASONING_CHAIN_FAST;
  const analysisLogs = analysisType === 'smart' ? MOCK_ANALYSIS_LOGS_SMART : MOCK_ANALYSIS_LOGS_FAST;

  const recommendedPlanIdx = React.useMemo(() => {
    const riskWeight = { Low: 1, Medium: 2, High: 3 };
    const severity = alert.severity?.toLowerCase() || 'warning';
    const isCritical = severity === 'critical' || severity === 'high';
    if (isCritical) {
      return MOCK_REMEDIATION_PLANS.reduce((best, plan, idx) =>
        riskWeight[plan.risk] < riskWeight[MOCK_REMEDIATION_PLANS[best].risk] ? idx : best, 0);
    }
    return MOCK_REMEDIATION_PLANS.reduce((best, plan, idx) =>
      riskWeight[plan.risk] <= riskWeight[MOCK_REMEDIATION_PLANS[best].risk] ? idx : best, 0);
  }, [alert.severity]);

  const handleAnalysisTypeChange = (type: 'smart' | 'fast') => {
    if (type === analysisType) return;
    setAnalysisType(type);
    setIsAnalysisRunning(true);
    setTimeout(() => setIsAnalysisRunning(false), 1500);
  };
  const [isApplyDropdownOpen, setIsApplyDropdownOpen] = React.useState(false);

  const affectedClusters = React.useMemo(() => {
    if (!alert.clusterName) return [];
    return alert.clusterName.split(',').map(c => c.trim()).filter(Boolean);
  }, [alert.clusterName]);

  const [selectedClusters, setSelectedClusters] = React.useState<Set<string>>(new Set(affectedClusters));

  React.useEffect(() => {
    setSelectedClusters(new Set(affectedClusters));
  }, [affectedClusters]);

  const toggleClusterSelection = (cluster: string) => {
    setSelectedClusters(prev => {
      const next = new Set(prev);
      if (next.has(cluster)) {
        next.delete(cluster);
      } else {
        next.add(cluster);
      }
      return next;
    });
  };

  const handleTestRemediation = () => {
    setTestState('testing');
    setTimeout(() => setTestState('tested'), 2000);
  };

  const getStatusColor = (status: ReasoningStep['status']) => {
    switch (status) {
      case 'success': return 'var(--pf-t--global--color--status--success--default)';
      case 'warning': return 'var(--pf-t--global--color--status--warning--default)';
      case 'info': return 'var(--pf-t--global--color--status--info--default)';
      case 'active': return 'var(--pf-t--global--color--status--info--default)';
      default: return 'var(--pf-t--global--text--color--subtle)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--pf-t--global--background--color--primary--default)' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--pf-t--global--border--color--default)', flexShrink: 0 }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <Button variant="plain" onClick={onBack} style={{ padding: '4px' }}>
                <ArrowLeftIcon />
              </Button>
              <Icon size="md"><AiTroubleshootIcon size={18} /></Icon>
              <Title headingLevel="h2" size="md">
                Investigate with AI
              </Title>
              <Button variant="link" isInline style={{ fontSize: '13px' }}>
                View in Investigation hub
              </Button>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Flex gap={{ default: 'gapXs' }}>
              <Dropdown
                isOpen={isKebabOpen}
                onOpenChange={(open) => setIsKebabOpen(open)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} variant="plain" onClick={() => setIsKebabOpen(!isKebabOpen)} isExpanded={isKebabOpen}>
                    <EllipsisVIcon />
                  </MenuToggle>
                )}
                popperProps={{ position: 'right' }}
              >
                <DropdownList>
                  <DropdownItem key="copy">Copy analysis</DropdownItem>
                  <DropdownItem key="export">Export report</DropdownItem>
                </DropdownList>
              </Dropdown>
              <Button variant="plain" aria-label="Close" onClick={onClose}>
                <TimesIcon />
              </Button>
            </Flex>
          </FlexItem>
        </Flex>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <Stack hasGutter>
          {/* Alert Name + Status */}
          <StackItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <Icon status="danger"><ExclamationCircleIcon /></Icon>
              <Title headingLevel="h3" size="md">{alert.alertName}</Title>
            </Flex>
            <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: '4px', fontSize: '13px' }}>
              {alert.description || `${alert.component} usage on a ${alert.group} component is critically high.`}
            </Content>
          </StackItem>

          {/* AI Insight */}
          <StackItem>
            <div style={{
              backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid var(--pf-t--global--border--color--default)',
            }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: '8px' }}>
                <Icon size="sm" status="info">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 1a5 5 0 00-2 9.58V12a1 1 0 001 1h2a1 1 0 001-1v-1.42A5 5 0 008 1zm1 13H7v1h2v-1z"/>
                  </svg>
                </Icon>
                <Content component="small" style={{ fontWeight: 600, fontSize: '13px' }}>AI Insights</Content>
              </Flex>
              <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px', lineHeight: '1.5' }}>
                A sharp increase in write operations coincided with log rotation failures on prod-api-server-04, causing disk space to deplete from 72% to 98% within 14 minutes. The host is at imminent risk of an I/O block crash.
              </Content>
            </div>
          </StackItem>

          {/* Analysis */}
          <StackItem>
            <Title headingLevel="h4" size="md" style={{ marginBottom: '8px' }}>Analysis</Title>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <Content component="small" style={{ fontSize: '13px', margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>Type:</Content>
              <div style={{ position: 'relative' }}>
                <MenuToggle
                  onClick={() => setIsAnalysisDropdownOpen(!isAnalysisDropdownOpen)}
                  isExpanded={isAnalysisDropdownOpen}
                  style={{ minWidth: '160px' }}
                >
                  {analysisType === 'smart' ? 'Smart' : 'Fast'}
                </MenuToggle>
                {isAnalysisDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 1000,
                    marginTop: '4px',
                    backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                    border: '1px solid var(--pf-t--global--border--color--default)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    minWidth: '280px',
                    overflow: 'hidden',
                  }}>
                    <div
                      onClick={() => { handleAnalysisTypeChange('smart'); setIsAnalysisDropdownOpen(false); }}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        backgroundColor: analysisType === 'smart' ? 'var(--pf-t--global--background--color--secondary--default)' : 'transparent',
                      }}
                    >
                      <Content component="small" style={{ fontWeight: 600, fontSize: '13px', margin: 0, display: 'block' }}>Smart</Content>
                      <Content component="small" style={{ fontSize: '12px', margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
                        Deep multi-signal correlation across metrics, logs, and traces. Higher confidence root-cause analysis.
                      </Content>
                    </div>
                    <div style={{ borderTop: '1px solid var(--pf-t--global--border--color--default)' }} />
                    <div
                      onClick={() => { handleAnalysisTypeChange('fast'); setIsAnalysisDropdownOpen(false); }}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        backgroundColor: analysisType === 'fast' ? 'var(--pf-t--global--background--color--secondary--default)' : 'transparent',
                      }}
                    >
                      <Content component="small" style={{ fontWeight: 600, fontSize: '13px', margin: 0, display: 'block' }}>Fast</Content>
                      <Content component="small" style={{ fontSize: '12px', margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
                        Quick single-signal analysis based on primary metric. Faster results for well-known alert patterns.
                      </Content>
                    </div>
                  </div>
                )}
              </div>
            </Flex>
          </StackItem>

          {/* Active Reasoning Chain */}
          <StackItem>
            <ExpandableSection
              toggleText="Active reasoning chain"
              isExpanded={isReasoningExpanded}
              onToggle={(_e, expanded) => setIsReasoningExpanded(expanded)}
            >
              {isAnalysisRunning ? (
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginTop: '12px', padding: '16px' }}>
                  <span className="pf-v5-c-spinner pf-m-md" role="progressbar" aria-label="Re-running analysis">
                    <span className="pf-v5-c-spinner__clipper" />
                    <span className="pf-v5-c-spinner__lead-ball" />
                    <span className="pf-v5-c-spinner__tail-ball" />
                  </span>
                  <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px', margin: 0 }}>
                    Re-running analysis ({analysisType === 'smart' ? 'Smart' : 'Fast'} mode)...
                  </Content>
                </Flex>
              ) : (
                <div style={{ paddingLeft: '8px', borderLeft: '2px solid var(--pf-t--global--border--color--default)', marginTop: '8px' }}>
                  <Stack hasGutter>
                    {reasoningChain.map((step, idx) => (
                      <StackItem key={idx}>
                        <Flex alignItems={{ default: 'alignItemsFlexStart' }} gap={{ default: 'gapSm' }}>
                          <FlexItem style={{ flexShrink: 0 }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(step.status),
                              marginTop: '5px',
                              marginLeft: '-13px',
                            }} />
                          </FlexItem>
                          <FlexItem style={{ flexShrink: 0 }}>
                            <Label isCompact variant="outline" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                              {step.timestamp}
                            </Label>
                          </FlexItem>
                          <FlexItem>
                            <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px', margin: 0 }}>
                              {step.description}
                            </Content>
                          </FlexItem>
                        </Flex>
                      </StackItem>
                    ))}
                  </Stack>
                </div>
              )}
            </ExpandableSection>
          </StackItem>

          {/* Analysis Logs */}
          <StackItem>
            <ExpandableSection
              toggleText="Analysis logs"
              isExpanded={isLogsExpanded}
              onToggle={(_e, expanded) => setIsLogsExpanded(expanded)}
            >
              <div style={{
                marginTop: '8px',
                maxHeight: '200px',
                overflow: 'auto',
                backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                border: '1px solid var(--pf-t--global--border--color--default)',
                borderRadius: '6px',
                padding: '12px',
              }}>
                <pre style={{
                  margin: 0,
                  fontSize: '11px',
                  lineHeight: '1.6',
                  fontFamily: 'var(--pf-t--global--font--family--mono)',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {analysisLogs}
                </pre>
              </div>
            </ExpandableSection>
          </StackItem>

          {/* Root Cause Analysis */}
          <StackItem>
            <ExpandableSection
              toggleText="Root Cause Analysis"
              isExpanded={isRootCauseExpanded}
              onToggle={(_e, expanded) => setIsRootCauseExpanded(expanded)}
            >
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid var(--pf-t--global--border--color--default)',
                  position: 'relative',
                }}>
                  <Button variant="plain" aria-label="Copy" style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M13 1H5a1 1 0 00-1 1v2h2V3h7v8h-1v2h2a1 1 0 001-1V2a1 1 0 00-1-1z"/><path d="M10 5H3a1 1 0 00-1 1v8a1 1 0 001 1h7a1 1 0 001-1V6a1 1 0 00-1-1zM9 13H4V7h5v6z"/></svg>
                  </Button>
                  <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px', lineHeight: '1.6', paddingRight: '24px' }}>
                    {MOCK_ROOT_CAUSE}
                  </Content>
                  <div style={{ marginTop: '12px' }}>
                    <Label isCompact color="blue">Confidence Score: 94%</Label>
                  </div>
                </div>
              </div>
            </ExpandableSection>
          </StackItem>

          {/* Suggested Remediation Plans */}
          <StackItem>
            <ExpandableSection
              toggleText="Suggested Remediation Plans"
              isExpanded={isRemediationExpanded}
              onToggle={(_e, expanded) => setIsRemediationExpanded(expanded)}
            >
              <div style={{ marginTop: '8px' }}>
                {/* Plan selector */}
                <Stack hasGutter>
                  {MOCK_REMEDIATION_PLANS.map((plan, planIdx) => (
                    <StackItem key={planIdx}>
                      <div
                        onClick={() => setSelectedPlanIdx(planIdx)}
                        style={{
                          padding: '12px',
                          borderRadius: '6px',
                          border: selectedPlanIdx === planIdx
                            ? '2px solid var(--pf-t--global--color--status--info--default)'
                            : '1px solid var(--pf-t--global--border--color--default)',
                          backgroundColor: selectedPlanIdx === planIdx
                            ? 'var(--pf-t--global--background--color--secondary--default)'
                            : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                              <input
                                type="radio"
                                name="remediation-plan"
                                checked={selectedPlanIdx === planIdx}
                                onChange={() => setSelectedPlanIdx(planIdx)}
                                style={{ margin: 0 }}
                              />
                              <Content component="small" style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>
                                Plan {planIdx + 1}: {plan.name}
                              </Content>
                              {testState === 'tested' && selectedPlanIdx === planIdx && (
                                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                                  <Icon size="sm" status="success"><CheckCircleIcon /></Icon>
                                  <Content component="small" style={{ fontSize: '12px', margin: 0, color: 'var(--pf-t--global--color--status--success--default)', fontWeight: 600 }}>
                                    Verified
                                  </Content>
                                </Flex>
                              )}
                            </Flex>
                          </FlexItem>
                          {planIdx === recommendedPlanIdx && (
                            <FlexItem>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--pf-t--global--color--status--info--default)" aria-hidden="true">
                                  <path d="M8 1.5l1.5 3 3.5.5-2.5 2.5.5 3.5L8 9.5 4.5 11l.5-3.5L2.5 5l3.5-.5z"/>
                                </svg>
                                <Content component="small" style={{ fontSize: '11px', margin: 0, color: 'var(--pf-t--global--color--status--info--default)', fontWeight: 600 }}>
                                  Recommended by AI
                                </Content>
                              </Flex>
                            </FlexItem>
                          )}
                        </Flex>
                        <Flex gap={{ default: 'gapXs' }} style={{ marginTop: '8px', marginLeft: '24px' }} flexWrap={{ default: 'wrap' }}>
                          <Label isCompact color={plan.risk === 'Low' ? 'green' : plan.risk === 'Medium' ? 'orange' : 'red'}>
                            Risk: {plan.risk}
                          </Label>
                          <Label isCompact color={plan.reversible ? 'blue' : 'gold'}>
                            {plan.reversible ? 'Reversible' : 'Non-reversible'}
                          </Label>
                          {plan.requiresRbac && (
                            <Label isCompact color="purple">
                              Requires RBAC
                            </Label>
                          )}
                        </Flex>

                        {/* Show steps when selected */}
                        {selectedPlanIdx === planIdx && (
                          <div style={{ marginTop: '12px', marginLeft: '24px' }}>
                            <Stack hasGutter>
                              {plan.steps.map((step, stepIdx) => (
                                <StackItem key={stepIdx}>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
                                    <FlexItem style={{ flexShrink: 0 }}>
                                      <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                                        border: '1px solid var(--pf-t--global--border--color--default)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        color: 'var(--pf-t--global--text--color--subtle)',
                                        fontWeight: 600,
                                      }}>
                                        {stepIdx + 1}
                                      </div>
                                    </FlexItem>
                                    <FlexItem>
                                      <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px', lineHeight: '1.5' }}>
                                        {step.parts.map((part, pIdx) =>
                                          typeof part === 'string' ? (
                                            <span key={pIdx}>{part}</span>
                                          ) : (
                                            <code key={pIdx} style={{
                                              backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                                              border: '1px solid var(--pf-t--global--border--color--default)',
                                              borderRadius: '3px',
                                              padding: '1px 4px',
                                              fontSize: '12px',
                                              fontFamily: 'var(--pf-t--global--font--family--mono)',
                                            }}>{part.code}</code>
                                          )
                                        )}
                                      </span>
                                    </FlexItem>
                                  </Flex>
                                </StackItem>
                              ))}
                            </Stack>

                            {/* RBAC Permissions Info */}
                            {plan.requiresRbac && plan.rbacPermissions && (
                              <div style={{
                                marginTop: '16px',
                                borderRadius: '6px',
                                border: '1px solid var(--pf-t--global--border--color--default)',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  padding: '12px 16px',
                                  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                                  borderBottom: '1px solid var(--pf-t--global--border--color--default)',
                                }}>
                                  <Content component="small" style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>
                                    Required RBAC Permissions
                                  </Content>
                                </div>
                                <div style={{ padding: '12px 16px' }}>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: '12px' }}>
                                    <Icon size="sm" status="danger"><ExclamationCircleIcon /></Icon>
                                    <Content component="small" style={{ fontWeight: 600, fontSize: '12px', margin: 0 }}>
                                      Review before approving
                                    </Content>
                                  </Flex>
                                  <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '12px', lineHeight: '1.5', fontStyle: 'italic', margin: '0 0 12px 0' }}>
                                    Review these permissions carefully before approving. This is the exact set of permissions the Lightspeed operator will grant to the agent&apos;s execution sandbox. These permissions are enforced on every iteration, including retries, and cannot be altered by the agent during execution.
                                  </Content>
                                  {plan.rbacPermissions.map((perm, permIdx) => (
                                    <div key={permIdx} style={{ marginTop: permIdx > 0 ? '12px' : 0 }}>
                                      <Content component="small" style={{ fontWeight: 600, fontSize: '12px', margin: '0 0 8px 0', display: 'block' }}>
                                        Namespace Scoped
                                      </Content>
                                      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '6px 12px', fontSize: '12px' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>Namespace</span>
                                        <span><Label isCompact variant="outline">{perm.namespace}</Label></span>
                                        <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>API Groups</span>
                                        <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
                                          {perm.apiGroups.map((g, i) => <Label key={i} isCompact variant="outline">{g}</Label>)}
                                        </Flex>
                                        <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>Resources</span>
                                        <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
                                          {perm.resources.map((r, i) => <Label key={i} isCompact color="blue">{r}</Label>)}
                                        </Flex>
                                        <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>Verbs</span>
                                        <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
                                          {perm.verbs.map((v, i) => <Label key={i} isCompact color="green">{v}</Label>)}
                                        </Flex>
                                        <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>Justification</span>
                                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>{perm.justification}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </StackItem>
                  ))}
                </Stack>

                {/* Action Buttons */}
                <div style={{ marginTop: '20px' }}>
                  {testState === 'idle' && (
                    <Button variant="primary" onClick={handleTestRemediation}>
                      Test Before Applying
                    </Button>
                  )}
                  {testState === 'testing' && (
                    <Button variant="primary" isLoading isDisabled>
                      Testing remediation plan
                    </Button>
                  )}
                  {testState === 'tested' && (
                    <>
                      {/* Verification Step */}
                      <div style={{
                        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                        borderRadius: '8px',
                        padding: '16px',
                        border: '1px solid var(--pf-t--global--border--color--default)',
                        marginBottom: '16px',
                      }}>
                        <Content component="small" style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                          Verification Step
                        </Content>
                        <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                          <strong>Post-Remediation Check:</strong> The agent will track disk utilization on{' '}
                          <code style={{
                            backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                            border: '1px solid var(--pf-t--global--border--color--default)',
                            borderRadius: '3px',
                            padding: '1px 4px',
                            fontSize: '12px',
                            fontFamily: 'var(--pf-t--global--font--family--mono)',
                          }}>prod-api-server-04</code>{' '}
                          for 5 minutes post-execution. Success criteria requires total disk usage to drop below 75% and{' '}
                          <code style={{
                            backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                            border: '1px solid var(--pf-t--global--border--color--default)',
                            borderRadius: '3px',
                            padding: '1px 4px',
                            fontSize: '12px',
                            fontFamily: 'var(--pf-t--global--font--family--mono)',
                          }}>logrotate.service</code>{' '}
                          to return a successful exit code (0).
                        </Content>
                        <Flex gap={{ default: 'gapMd' }} style={{ marginTop: '12px' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <Button variant="link" style={{ paddingLeft: 0 }} icon={<AiExperienceIcon />}>
                            Discuss with LightSpeed
                          </Button>
                          <Button variant="link" style={{ paddingLeft: 0 }} icon={<DownloadIcon />}>
                            Download remediation guide
                          </Button>
                        </Flex>
                      </div>
                      {affectedClusters.length > 1 ? (
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapNone' }}>
                          <FlexItem>
                            <Button variant="primary" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                              Apply Remediation ({selectedClusters.size} of {affectedClusters.length} clusters)
                            </Button>
                          </FlexItem>
                          <FlexItem>
                            <Dropdown
                              isOpen={isApplyDropdownOpen}
                              onOpenChange={(open) => setIsApplyDropdownOpen(open)}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  variant="primary"
                                  onClick={() => setIsApplyDropdownOpen(!isApplyDropdownOpen)}
                                  isExpanded={isApplyDropdownOpen}
                                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '8px', paddingRight: '8px' }}
                                  aria-label="Select clusters"
                                >
                                  {null}
                                </MenuToggle>
                              )}
                              popperProps={{ position: 'right' }}
                            >
                              <DropdownList>
                                <DropdownItem key="select-all" onClick={() => setSelectedClusters(new Set(affectedClusters))}>
                                  Select all clusters
                                </DropdownItem>
                                <DropdownItem key="deselect-all" onClick={() => setSelectedClusters(new Set())}>
                                  Deselect all
                                </DropdownItem>
                                <Divider component="li" />
                                {affectedClusters.map((cluster) => (
                                  <DropdownItem key={cluster} onClick={(e) => { e.preventDefault(); toggleClusterSelection(cluster); }} style={{ padding: '8px 16px' }}>
                                    <Checkbox
                                      id={`cluster-${cluster}`}
                                      label={cluster}
                                      isChecked={selectedClusters.has(cluster)}
                                      onChange={() => toggleClusterSelection(cluster)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </DropdownItem>
                                ))}
                              </DropdownList>
                            </Dropdown>
                          </FlexItem>
                        </Flex>
                      ) : (
                        <Button variant="primary">
                          Apply Remediation
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </ExpandableSection>
          </StackItem>
        </Stack>
      </div>

      {/* Footer disclaimer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--pf-t--global--border--color--default)',
        flexShrink: 0,
      }}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <Icon size="sm" status="info"><InfoCircleIcon /></Icon>
          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '12px', margin: 0 }}>
            Always review AI-generated content prior to use.
          </Content>
        </Flex>
      </div>
    </div>
  );
};
