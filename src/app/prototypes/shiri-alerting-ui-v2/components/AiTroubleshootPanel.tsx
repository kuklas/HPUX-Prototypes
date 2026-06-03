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

interface InvestigationStep {
  action: string;
  component: string;
  durationMs: number;
  result: string;
  leadsTo?: number;
}

const MOCK_STEPS_SMART: InvestigationStep[] = [
  { action: 'Queried node-level disk metrics', component: '/var partition', durationMs: 560, result: '98.4% capacity, 1.6% remaining', leadsTo: 2 },
  { action: 'Scanned nginx container logs', component: 'nginx (PID 2847)', durationMs: 2400, result: 'Writing 85MB/s to access.log', leadsTo: 3 },
  { action: 'Inspected file system inodes', component: '/var/log/nginx/access.log', durationMs: 3100, result: 'Single file at 142GB, unrotated', leadsTo: 4 },
  { action: 'Checked logrotate service status', component: 'logrotate.service', durationMs: 8200, result: 'Found permission exception 0644', leadsTo: 5 },
  { action: 'Cross-referenced deployment events', component: 'ansible-playbook', durationMs: 5400, result: 'security-hardening.yml modified /etc/logrotate.d/*', leadsTo: 6 },
  { action: 'Assessed blast radius across fleet', component: 'Cluster fleet', durationMs: 7100, result: '3 additional hosts share same config' },
];

const MOCK_STEPS_FAST: InvestigationStep[] = [
  { action: 'Queried primary disk metric', component: '/var partition', durationMs: 340, result: '98.4% capacity detected', leadsTo: 2 },
  { action: 'Matched known alert pattern', component: 'Pattern DB (DISK-003)', durationMs: 6200, result: 'Large log + failed logrotate match' },
];

interface TopologyNode {
  id: string;
  label: string;
  type: 'cluster' | 'node' | 'pod' | 'service';
}

interface TopologyEdge {
  from: string;
  to: string;
  annotation: string;
}

const TOPOLOGY_NODES: TopologyNode[] = [
  { id: 'cluster', label: 'prod-cluster-east', type: 'cluster' },
  { id: 'node', label: 'prod-api-server-04', type: 'node' },
  { id: 'pod-nginx', label: 'nginx-7b4d6', type: 'pod' },
  { id: 'svc-logrotate', label: 'logrotate.service', type: 'service' },
  { id: 'pod-nginx-2', label: 'nginx-8c5e7', type: 'pod' },
];

const TOPOLOGY_EDGES: TopologyEdge[] = [
  { from: 'cluster', to: 'node', annotation: '98.4% disk' },
  { from: 'node', to: 'pod-nginx', annotation: '85MB/s write' },
  { from: 'node', to: 'svc-logrotate', annotation: 'exit 1' },
  { from: 'node', to: 'pod-nginx-2', annotation: 'at risk' },
];

const MOCK_ANALYSIS_LOGS_SMART = `INFO  Starting deep multi-signal analysis for alert DiskUsageCritical
DEBUG Connecting to metrics store (prometheus-k8s.openshift-monitoring:9090)
INFO  Query: node_filesystem_avail_bytes{mountpoint="/var"} / node_filesystem_size_bytes{mountpoint="/var"}
INFO  Result: 1.6% available (threshold: 5%)
INFO  Isolating anomaly: /var partition identified as root cause
DEBUG Scanning process table for high disk I/O writers
INFO  Found: nginx (PID 2847) writing 85MB/s to /var/log/nginx/access.log
INFO  File inspection: /var/log/nginx/access.log size=142GB modified=2m ago
DEBUG Checking systemd unit status for logrotate.service
WARN  logrotate.service: exit-code 1 (Permission Denied)
INFO  Cross-referencing deployment/change events in 24h window
INFO  Match: ansible-playbook security-hardening.yml executed
WARN  Blast-radius: 3 additional hosts share playbook config (prod-api-server-01,02,03)
INFO  Analysis complete. Confidence: 94%`;

const MOCK_ANALYSIS_LOGS_FAST = `INFO  Starting fast single-signal analysis for alert DiskUsageCritical
DEBUG Connecting to metrics store (prometheus-k8s.openshift-monitoring:9090)
INFO  Query: node_filesystem_avail_bytes{mountpoint="/var"}
INFO  Identified /var as primary contributor (98.4% used)
INFO  Pattern match: large log + failed logrotate (known pattern ID: DISK-003)
INFO  Analysis complete. Confidence: 78%`;

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
  description: string;
  risk: 'Low' | 'Medium' | 'High';
  reversible: boolean;
  requiresRbac: boolean;
  rbacPermissions?: RbacPermission[];
  steps: { parts: InlinePart[] }[];
  createdAt: string;
  createdBy: string;
}

const MOCK_REMEDIATION_PLANS: RemediationPlan[] = [
  {
    name: 'Safe log rotation fix',
    description: 'Automates log rotation config updates and archives stale logs safely without service disruption.',
    risk: 'Low',
    reversible: true,
    requiresRbac: false,
    createdAt: '2 hours ago',
    createdBy: 'Lightspeed AI Agent',
    steps: [
      { parts: ['Safely archive and gzip ', { code: '/var/log/nginx/access.log' }, ' to a backup block storage mount (', { code: '/mnt/backup' }, ').'] },
      { parts: ['Correct the configuration permissions file at ', { code: '/etc/logrotate.d/nginx' }, '.'] },
      { parts: ['Execute a dry-run test of ', { code: 'logrotate -f /etc/logrotate.d/nginx' }, ' to ensure future stability.'] },
    ],
  },
  {
    name: 'Service restart with log cleanup',
    description: 'Restarts the nginx service after truncating bloated logs and fixing file permissions.',
    risk: 'Medium',
    reversible: true,
    requiresRbac: true,
    createdAt: '1 hour ago',
    createdBy: 'Lightspeed AI Agent',
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
    description: 'Aggressive disk reclaim via log purge, LVM resize, and retention policy reconfiguration.',
    risk: 'High',
    reversible: false,
    requiresRbac: true,
    createdAt: '45 min ago',
    createdBy: 'SRE Runbook Engine',
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
  const [analysisApproved, setAnalysisApproved] = React.useState(false);
  const [preApprovalType, setPreApprovalType] = React.useState<'smart' | 'fast'>('smart');
  const [isRootCauseExpanded, setIsRootCauseExpanded] = React.useState(false);
  const [isRemediationExpanded, setIsRemediationExpanded] = React.useState(false);
  const [rootCauseAcknowledged, setRootCauseAcknowledged] = React.useState(false);
  const [testState, setTestState] = React.useState<'idle' | 'testing' | 'tested'>('idle');
  const [analysisType, setAnalysisType] = React.useState<'smart' | 'fast'>('smart');
  const [isAnalysisDropdownOpen, setIsAnalysisDropdownOpen] = React.useState(false);
  const [isAnalysisRunning, setIsAnalysisRunning] = React.useState(false);
  const [showEvidence, setShowEvidence] = React.useState(false);
  const [evidenceView, setEvidenceView] = React.useState<'timeline' | 'topology'>('timeline');
  const [showRawLogs, setShowRawLogs] = React.useState(false);
  const [showAllLogs, setShowAllLogs] = React.useState(false);
  const [selectedPlanIdx, setSelectedPlanIdx] = React.useState(0);
  const [showRawCommands, setShowRawCommands] = React.useState(false);
  const [showRbacRoles, setShowRbacRoles] = React.useState(false);
  const [topologyZoom, setTopologyZoom] = React.useState(1);
  const [analysisComplete, setAnalysisComplete] = React.useState(false);

  const investigationSteps = analysisType === 'smart' ? MOCK_STEPS_SMART : MOCK_STEPS_FAST;
  const analysisLogs = analysisType === 'smart' ? MOCK_ANALYSIS_LOGS_SMART : MOCK_ANALYSIS_LOGS_FAST;

  const handleApproveAnalysis = () => {
    setAnalysisType(preApprovalType);
    setAnalysisApproved(true);
  };

  // Phase 2: Auto-reveal root cause after reasoning chain "completes"
  React.useEffect(() => {
    if (!analysisApproved) return;
    const timer = setTimeout(() => {
      setAnalysisComplete(true);
      setIsRootCauseExpanded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [analysisApproved]);

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
    setAnalysisComplete(false);
    setIsRootCauseExpanded(false);
    setRootCauseAcknowledged(false);
    setIsRemediationExpanded(false);
    setTimeout(() => {
      setIsAnalysisRunning(false);
      setAnalysisComplete(true);
      setIsRootCauseExpanded(true);
    }, 1500);
  };

  const handleAcknowledgeRootCause = () => {
    setRootCauseAcknowledged(true);
    setIsRemediationExpanded(true);
  };
  const [isApplyDropdownOpen, setIsApplyDropdownOpen] = React.useState(false);

  const affectedClusters = React.useMemo(() => {
    if (!alert.clusterName) return [];
    return alert.clusterName.split(',').map(c => c.trim()).filter(Boolean);
  }, [alert.clusterName]);

  const ineligibleClusters = React.useMemo<{ name: string; reason: string }[]>(() => [
    { name: 'prod-cluster-us-west-02', reason: 'Cluster is in maintenance mode until Jun 5' },
    { name: 'prod-cluster-eu-central-01', reason: 'Insufficient RBAC permissions for this cluster' },
  ], []);

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

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
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

          {/* AI Insight — always visible */}
          <StackItem>
            <div style={{
              backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid var(--pf-t--global--border--color--default)',
            }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: '8px' }}>
                <AiExperienceIcon size={16} />
                <Content component="small" style={{ fontWeight: 600, fontSize: '13px' }}>AI Insights</Content>
              </Flex>
              <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px', lineHeight: '1.5' }}>
                A sharp increase in write operations coincided with log rotation failures on prod-api-server-04, causing disk space to deplete from 72% to 98% within 14 minutes. The host is at imminent risk of an I/O block crash.
              </Content>
            </div>
          </StackItem>

          {/* Pre-analysis approval step */}
          {!analysisApproved && (
            <StackItem>
              <div style={{
                backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid var(--pf-t--global--border--color--default)',
              }}>
                <Content component="small" style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px', display: 'block' }}>
                  Select analysis method
                </Content>
                <Stack hasGutter>
                  <StackItem>
                    <div
                      onClick={() => setPreApprovalType('smart')}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        border: preApprovalType === 'smart'
                          ? '2px solid var(--pf-t--global--color--status--info--default)'
                          : '1px solid var(--pf-t--global--border--color--default)',
                        backgroundColor: preApprovalType === 'smart'
                          ? 'var(--pf-t--global--background--color--primary--default)'
                          : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <input type="radio" name="analysis-type-approval" checked={preApprovalType === 'smart'} onChange={() => setPreApprovalType('smart')} style={{ margin: 0 }} />
                        <FlexItem style={{ flex: 1 }}>
                          <Content component="small" style={{ fontWeight: 600, fontSize: '13px', margin: 0, display: 'block' }}>Smart analysis</Content>
                          <Content component="small" style={{ fontSize: '12px', margin: '2px 0 0', color: 'var(--pf-t--global--text--color--subtle)', display: 'block' }}>
                            Deep multi-signal correlation across metrics, logs, and events. Higher confidence results.
                          </Content>
                        </FlexItem>
                        <FlexItem>
                          <Label isCompact variant="outline" style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '11px' }}>
                            ~2,400 tokens
                          </Label>
                        </FlexItem>
                      </Flex>
                    </div>
                  </StackItem>
                  <StackItem>
                    <div
                      onClick={() => setPreApprovalType('fast')}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        border: preApprovalType === 'fast'
                          ? '2px solid var(--pf-t--global--color--status--info--default)'
                          : '1px solid var(--pf-t--global--border--color--default)',
                        backgroundColor: preApprovalType === 'fast'
                          ? 'var(--pf-t--global--background--color--primary--default)'
                          : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <input type="radio" name="analysis-type-approval" checked={preApprovalType === 'fast'} onChange={() => setPreApprovalType('fast')} style={{ margin: 0 }} />
                        <FlexItem style={{ flex: 1 }}>
                          <Content component="small" style={{ fontWeight: 600, fontSize: '13px', margin: 0, display: 'block' }}>Fast analysis</Content>
                          <Content component="small" style={{ fontSize: '12px', margin: '2px 0 0', color: 'var(--pf-t--global--text--color--subtle)', display: 'block' }}>
                            Quick pattern-matching against known alert signatures. Lower token usage.
                          </Content>
                        </FlexItem>
                        <FlexItem>
                          <Label isCompact variant="outline" style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '11px' }}>
                            ~800 tokens
                          </Label>
                        </FlexItem>
                      </Flex>
                    </div>
                  </StackItem>
                </Stack>
                <Button variant="primary" style={{ marginTop: '16px' }} onClick={handleApproveAnalysis}>
                  Run {preApprovalType === 'smart' ? 'smart' : 'fast'} analysis
                </Button>
              </div>
            </StackItem>
          )}

          {/* Analysis in progress indicator */}
          {analysisApproved && !analysisComplete && (
            <StackItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ padding: '12px 0' }}>
                <span className="pf-v5-c-spinner pf-m-md" role="progressbar" aria-label="Analysis in progress">
                  <span className="pf-v5-c-spinner__clipper" />
                  <span className="pf-v5-c-spinner__lead-ball" />
                  <span className="pf-v5-c-spinner__tail-ball" />
                </span>
                <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px', margin: 0 }}>
                  Running {analysisType === 'smart' ? 'smart' : 'fast'} analysis...
                </Content>
              </Flex>
            </StackItem>
          )}

          {/* Root Cause Analysis - Phase 2: Auto-revealed */}
          {analysisComplete && (
            <StackItem style={{ transition: 'opacity 0.3s ease-in', opacity: analysisComplete ? 1 : 0 }}>
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
                    <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginTop: '12px' }}>
                      <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <Label isCompact variant="outline">Confidence: 94%</Label>
                        <Label isCompact variant="outline">{analysisType === 'smart' ? 'Smart' : 'Fast'} analysis</Label>
                      </Flex>
                      {!rootCauseAcknowledged ? (
                        <Button variant="secondary" size="sm" onClick={handleAcknowledgeRootCause}>
                          Acknowledge &amp; view remediation
                        </Button>
                      ) : (
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                          <Icon size="sm" status="success"><CheckCircleIcon /></Icon>
                          <Content component="small" style={{ fontSize: '12px', margin: 0, color: 'var(--pf-t--global--color--status--success--default)' }}>Acknowledged</Content>
                        </Flex>
                      )}
                    </Flex>
                  </div>

                  {/* Supporting evidence: dual-view diagnostic */}
                  <div style={{ marginTop: '12px' }}>
                    <Button
                      variant="link"
                      isInline
                      onClick={() => setShowEvidence(!showEvidence)}
                      aria-expanded={showEvidence}
                      aria-controls="rca-supporting-evidence"
                      style={{ fontSize: '13px', paddingLeft: 0 }}
                      icon={
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ transform: showEvidence ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                          <path d="M6 4l4 4-4 4z"/>
                        </svg>
                      }
                    >
                      {showEvidence ? 'Hide supporting evidence' : 'View supporting evidence'}
                    </Button>

                    {showEvidence && (
                      <div
                        id="rca-supporting-evidence"
                        role="region"
                        aria-label="Supporting evidence for root cause analysis"
                        style={{
                          marginTop: '10px',
                          borderLeft: '3px solid var(--pf-t--global--border--color--default)',
                          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                          borderRadius: '0 6px 6px 0',
                          padding: '12px 12px 12px 16px',
                        }}
                      >
                        {/* Analysis type selector */}
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: '12px' }}>
                          <Content component="small" style={{ fontSize: '12px', margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>Analysis:</Content>
                          <div style={{ position: 'relative' }}>
                            <MenuToggle
                              onClick={() => setIsAnalysisDropdownOpen(!isAnalysisDropdownOpen)}
                              isExpanded={isAnalysisDropdownOpen}
                              style={{ minWidth: '120px' }}
                              aria-label="Select analysis type"
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
                                minWidth: '240px',
                                overflow: 'hidden',
                              }}>
                                <div
                                  role="option"
                                  aria-selected={analysisType === 'smart'}
                                  onClick={() => { handleAnalysisTypeChange('smart'); setIsAnalysisDropdownOpen(false); }}
                                  style={{
                                    padding: '10px 16px',
                                    cursor: 'pointer',
                                    backgroundColor: analysisType === 'smart' ? 'var(--pf-t--global--background--color--secondary--default)' : 'transparent',
                                  }}
                                >
                                  <Content component="small" style={{ fontWeight: 600, fontSize: '13px', margin: 0, display: 'block' }}>Smart</Content>
                                  <Content component="small" style={{ fontSize: '11px', margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
                                    Deep multi-signal correlation. Higher confidence.
                                  </Content>
                                </div>
                                <div style={{ borderTop: '1px solid var(--pf-t--global--border--color--default)' }} />
                                <div
                                  role="option"
                                  aria-selected={analysisType === 'fast'}
                                  onClick={() => { handleAnalysisTypeChange('fast'); setIsAnalysisDropdownOpen(false); }}
                                  style={{
                                    padding: '10px 16px',
                                    cursor: 'pointer',
                                    backgroundColor: analysisType === 'fast' ? 'var(--pf-t--global--background--color--secondary--default)' : 'transparent',
                                  }}
                                >
                                  <Content component="small" style={{ fontWeight: 600, fontSize: '13px', margin: 0, display: 'block' }}>Fast</Content>
                                  <Content component="small" style={{ fontSize: '11px', margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
                                    Quick single-signal analysis for known patterns.
                                  </Content>
                                </div>
                              </div>
                            )}
                          </div>
                        </Flex>

                        {/* View switcher (segmented control) */}
                        <div role="tablist" aria-label="Evidence view" style={{
                          display: 'inline-flex',
                          border: '1px solid var(--pf-t--global--border--color--default)',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          marginBottom: '12px',
                        }}>
                          <button
                            role="tab"
                            aria-selected={evidenceView === 'timeline'}
                            aria-controls="evidence-panel-timeline"
                            onClick={() => setEvidenceView('timeline')}
                            style={{
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: evidenceView === 'timeline' ? 'var(--pf-t--global--background--color--primary--default)' : 'transparent',
                              color: evidenceView === 'timeline' ? 'var(--pf-t--global--text--color--regular)' : 'var(--pf-t--global--text--color--subtle)',
                              borderRight: '1px solid var(--pf-t--global--border--color--default)',
                            }}
                          >
                            Investigation timeline
                          </button>
                          <button
                            role="tab"
                            aria-selected={evidenceView === 'topology'}
                            aria-controls="evidence-panel-topology"
                            onClick={() => setEvidenceView('topology')}
                            style={{
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: evidenceView === 'topology' ? 'var(--pf-t--global--background--color--primary--default)' : 'transparent',
                              color: evidenceView === 'topology' ? 'var(--pf-t--global--text--color--regular)' : 'var(--pf-t--global--text--color--subtle)',
                            }}
                          >
                            Topology view
                          </button>
                        </div>

                        {/* Investigation Timeline panel */}
                        {evidenceView === 'timeline' && (
                          <div id="evidence-panel-timeline" role="tabpanel" aria-label="Investigation timeline">
                            {isAnalysisRunning ? (
                              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ padding: '12px 0' }}>
                                <span className="pf-v5-c-spinner pf-m-sm" role="progressbar" aria-label="Re-running analysis">
                                  <span className="pf-v5-c-spinner__clipper" />
                                  <span className="pf-v5-c-spinner__lead-ball" />
                                  <span className="pf-v5-c-spinner__tail-ball" />
                                </span>
                                <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '12px', margin: 0 }}>
                                  Re-running analysis...
                                </Content>
                              </Flex>
                            ) : (
                              <div style={{ position: 'relative', paddingLeft: '20px' }}>
                                {/* Continuous vertical connector line */}
                                <div style={{
                                  position: 'absolute',
                                  left: '9px',
                                  top: '12px',
                                  bottom: '12px',
                                  width: '2px',
                                  backgroundColor: 'var(--pf-t--global--border--color--default)',
                                }} />
                                <Stack hasGutter>
                                  {investigationSteps.map((step, idx) => (
                                    <StackItem key={idx}>
                                      <div style={{ position: 'relative' }}>
                                        {/* Step dot */}
                                        <div style={{
                                          position: 'absolute',
                                          left: '-16px',
                                          top: '4px',
                                          width: '12px',
                                          height: '12px',
                                          borderRadius: '50%',
                                          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                                          border: '2px solid var(--pf-t--global--border--color--default)',
                                          zIndex: 1,
                                        }} />
                                        {/* Step content */}
                                        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                                          <FlexItem style={{ flex: 1 }}>
                                            <Content component="p" style={{ fontSize: '12px', margin: 0, fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>
                                              {step.action}
                                            </Content>
                                            <Content component="small" style={{ fontSize: '11px', margin: '2px 0 0', color: 'var(--pf-t--global--text--color--subtle)', display: 'block' }}>
                                              {step.component}
                                            </Content>
                                          </FlexItem>
                                          <FlexItem>
                                            <Label isCompact variant="outline" style={{ fontSize: '10px', fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
                                              {formatDuration(step.durationMs)}
                                            </Label>
                                          </FlexItem>
                                        </Flex>
                                        {/* Result and causal link */}
                                        <Content component="small" style={{ fontSize: '11px', margin: '4px 0 0', color: 'var(--pf-t--global--text--color--subtle)', display: 'block' }}>
                                          {step.result}{step.leadsTo && <span style={{ marginLeft: '6px', fontWeight: 600 }}>{'\u2192'} Led to Step {step.leadsTo}</span>}
                                        </Content>
                                      </div>
                                    </StackItem>
                                  ))}
                                </Stack>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Topology View panel — inline micro-canvas */}
                        {evidenceView === 'topology' && (
                          <div id="evidence-panel-topology" role="tabpanel" aria-label="Topology view">
                            <div style={{
                              backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                              border: '1px solid var(--pf-t--global--border--color--default)',
                              borderRadius: '6px',
                              position: 'relative',
                              overflow: 'hidden',
                            }}>
                              {/* Scrollable/pannable canvas area */}
                              <div style={{
                                overflow: 'auto',
                                maxHeight: '220px',
                                padding: '12px',
                                scrollBehavior: 'smooth',
                                cursor: topologyZoom > 1 ? 'grab' : 'default',
                              }}>
                                <svg
                                  width={360 * topologyZoom}
                                  height={180 * topologyZoom}
                                  viewBox="0 0 360 180"
                                  fill="none"
                                  aria-hidden="true"
                                  style={{ display: 'block', transition: 'width 0.2s ease, height 0.2s ease' }}
                                >
                                  <rect x="10" y="70" width="80" height="40" rx="6" stroke="var(--pf-t--global--color--status--info--default)" strokeWidth="2" fill="var(--pf-t--global--background--color--secondary--default)" />
                                  <text x="50" y="87" textAnchor="middle" fontSize="8" fill="var(--pf-t--global--text--color--regular)" fontWeight="600">Cluster</text>
                                  <text x="50" y="100" textAnchor="middle" fontSize="7" fill="var(--pf-t--global--text--color--subtle)">prod-east</text>
                                  <rect x="140" y="70" width="80" height="40" rx="6" stroke="var(--pf-t--global--border--color--default)" strokeWidth="1.5" fill="var(--pf-t--global--background--color--secondary--default)" />
                                  <text x="180" y="87" textAnchor="middle" fontSize="8" fill="var(--pf-t--global--text--color--regular)" fontWeight="600">Node</text>
                                  <text x="180" y="100" textAnchor="middle" fontSize="7" fill="var(--pf-t--global--text--color--subtle)">api-server-04</text>
                                  <rect x="270" y="20" width="80" height="36" rx="6" stroke="var(--pf-t--global--border--color--default)" strokeWidth="1.5" fill="var(--pf-t--global--background--color--secondary--default)" />
                                  <text x="310" y="35" textAnchor="middle" fontSize="7" fill="var(--pf-t--global--text--color--regular)" fontWeight="600">Pod</text>
                                  <text x="310" y="47" textAnchor="middle" fontSize="6" fill="var(--pf-t--global--text--color--subtle)">nginx-7b4d6</text>
                                  <rect x="270" y="72" width="80" height="36" rx="6" stroke="var(--pf-t--global--border--color--default)" strokeWidth="1.5" fill="var(--pf-t--global--background--color--secondary--default)" />
                                  <text x="310" y="87" textAnchor="middle" fontSize="7" fill="var(--pf-t--global--text--color--regular)" fontWeight="600">Service</text>
                                  <text x="310" y="99" textAnchor="middle" fontSize="6" fill="var(--pf-t--global--text--color--subtle)">logrotate</text>
                                  <rect x="270" y="124" width="80" height="36" rx="6" stroke="var(--pf-t--global--border--color--default)" strokeWidth="1.5" fill="var(--pf-t--global--background--color--secondary--default)" />
                                  <text x="310" y="139" textAnchor="middle" fontSize="7" fill="var(--pf-t--global--text--color--regular)" fontWeight="600">Pod</text>
                                  <text x="310" y="151" textAnchor="middle" fontSize="6" fill="var(--pf-t--global--text--color--subtle)">nginx-8c5e7</text>
                                  <line x1="90" y1="90" x2="140" y2="90" stroke="var(--pf-t--global--border--color--default)" strokeWidth="1.5" markerEnd="url(#arr-inline)" />
                                  <rect x="98" y="78" width="38" height="14" rx="3" fill="var(--pf-t--global--background--color--primary--default)" stroke="var(--pf-t--global--border--color--default)" strokeWidth="0.5" />
                                  <text x="117" y="88" textAnchor="middle" fontSize="6" fill="var(--pf-t--global--text--color--subtle)">98.4%</text>
                                  <line x1="220" y1="82" x2="270" y2="38" stroke="var(--pf-t--global--border--color--default)" strokeWidth="1.5" markerEnd="url(#arr-inline)" />
                                  <rect x="230" y="50" width="38" height="14" rx="3" fill="var(--pf-t--global--background--color--primary--default)" stroke="var(--pf-t--global--border--color--default)" strokeWidth="0.5" />
                                  <text x="249" y="60" textAnchor="middle" fontSize="6" fill="var(--pf-t--global--text--color--subtle)">85MB/s</text>
                                  <line x1="220" y1="90" x2="270" y2="90" stroke="var(--pf-t--global--border--color--default)" strokeWidth="1.5" markerEnd="url(#arr-inline)" />
                                  <rect x="230" y="80" width="30" height="14" rx="3" fill="var(--pf-t--global--background--color--primary--default)" stroke="var(--pf-t--global--border--color--default)" strokeWidth="0.5" />
                                  <text x="245" y="90" textAnchor="middle" fontSize="6" fill="var(--pf-t--global--text--color--subtle)">exit 1</text>
                                  <line x1="220" y1="98" x2="270" y2="142" stroke="var(--pf-t--global--border--color--default)" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arr-inline)" />
                                  <rect x="228" y="112" width="36" height="14" rx="3" fill="var(--pf-t--global--background--color--primary--default)" stroke="var(--pf-t--global--border--color--default)" strokeWidth="0.5" />
                                  <text x="246" y="122" textAnchor="middle" fontSize="6" fill="var(--pf-t--global--text--color--subtle)">at risk</text>
                                  <defs>
                                    <marker id="arr-inline" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                                      <polygon points="0 0, 6 2, 0 4" fill="var(--pf-t--global--border--color--default)" />
                                    </marker>
                                  </defs>
                                </svg>
                              </div>
                              {/* Inline zoom controls */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '6px',
                                padding: '6px 12px',
                                borderTop: '1px solid var(--pf-t--global--border--color--default)',
                                backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                              }}>
                                <Button variant="plain" size="sm" onClick={() => setTopologyZoom(z => Math.max(0.75, z - 0.25))} aria-label="Zoom out" style={{ padding: '2px 6px' }}>
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 6.25h5v1.5h-5z"/><path d="M7 1a6 6 0 104.45 10.16l3.2 3.2a.75.75 0 001.06-1.06l-3.2-3.2A6 6 0 007 1zM2.5 7a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/></svg>
                                </Button>
                                <Content component="small" style={{ fontSize: '11px', margin: 0, minWidth: '32px', textAlign: 'center', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                  {Math.round(topologyZoom * 100)}%
                                </Content>
                                <Button variant="plain" size="sm" onClick={() => setTopologyZoom(z => Math.min(2.5, z + 0.25))} aria-label="Zoom in" style={{ padding: '2px 6px' }}>
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M6.25 4.5h1.5v2h2v1.5h-2v2h-1.5v-2h-2V6.5h2z"/><path d="M7 1a6 6 0 104.45 10.16l3.2 3.2a.75.75 0 001.06-1.06l-3.2-3.2A6 6 0 007 1zM2.5 7a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/></svg>
                                </Button>
                                <Button variant="link" size="sm" onClick={() => setTopologyZoom(1)} style={{ fontSize: '11px', padding: '2px 6px' }}>
                                  Reset
                                </Button>
                              </div>
                            </div>
                            {/* Accessible tree fallback for screen readers */}
                            <div className="pf-v5-u-screen-reader" aria-label="Topology structure">
                              <ul role="tree" aria-label="Blast radius topology">
                                <li role="treeitem" aria-level={1}>prod-cluster-east (Cluster)
                                  <ul role="group">
                                    <li role="treeitem" aria-level={2}>prod-api-server-04 (Node, 98.4% disk)
                                      <ul role="group">
                                        <li role="treeitem" aria-level={3}>nginx-7b4d6 (Pod, 85MB/s write)</li>
                                        <li role="treeitem" aria-level={3}>logrotate.service (Service, exit code 1)</li>
                                        <li role="treeitem" aria-level={3}>nginx-8c5e7 (Pod, at risk)</li>
                                      </ul>
                                    </li>
                                  </ul>
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Raw analysis logs (expandable) */}
                        <div style={{ marginTop: '12px' }}>
                          <Button
                            variant="link"
                            isInline
                            onClick={() => { setShowRawLogs(!showRawLogs); if (showRawLogs) setShowAllLogs(false); }}
                            aria-expanded={showRawLogs}
                            aria-controls="evidence-raw-logs"
                            style={{ fontSize: '12px', paddingLeft: 0, fontWeight: 600 }}
                            icon={
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ transform: showRawLogs ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                                <path d="M6 4l4 4-4 4z"/>
                              </svg>
                            }
                          >
                            Raw analysis logs
                          </Button>
                          {showRawLogs && (
                            <div id="evidence-raw-logs" role="region" aria-label="Raw analysis logs" style={{ marginTop: '8px' }}>
                              {(() => {
                                const logLines = analysisLogs.split('\n');
                                const visibleLines = showAllLogs ? logLines : logLines.slice(0, 3);
                                const hiddenCount = logLines.length - 3;
                                return (
                                  <div style={{
                                    backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                                    border: '1px solid var(--pf-t--global--border--color--default)',
                                    borderRadius: '4px',
                                    padding: '10px',
                                    maxHeight: '200px',
                                    overflow: 'auto',
                                  }}>
                                    <pre style={{
                                      margin: 0,
                                      fontSize: '10px',
                                      lineHeight: '1.6',
                                      fontFamily: 'var(--pf-t--global--font--family--mono)',
                                      color: 'var(--pf-t--global--text--color--subtle)',
                                      whiteSpace: 'pre-wrap',
                                      wordBreak: 'break-all',
                                    }}>
                                      {visibleLines.join('\n')}
                                    </pre>
                                    {!showAllLogs && hiddenCount > 0 && (
                                      <Button
                                        variant="link"
                                        isInline
                                        onClick={() => setShowAllLogs(true)}
                                        style={{ marginTop: '6px', fontSize: '11px', paddingLeft: 0 }}
                                      >
                                        Show {hiddenCount} more log lines
                                      </Button>
                                    )}
                                    {showAllLogs && (
                                      <Button
                                        variant="link"
                                        isInline
                                        onClick={() => setShowAllLogs(false)}
                                        style={{ marginTop: '6px', fontSize: '11px', paddingLeft: 0 }}
                                      >
                                        Show less
                                      </Button>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ExpandableSection>
            </StackItem>
          )}

          {/* Suggested Remediation Plans - Phase 3: User-triggered */}
          {rootCauseAcknowledged && (
            <StackItem style={{ transition: 'opacity 0.3s ease-in', opacity: rootCauseAcknowledged ? 1 : 0 }}>
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
                        onClick={() => { setSelectedPlanIdx(planIdx); setShowRawCommands(false); setShowRbacRoles(false); }}
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
                                onChange={() => { setSelectedPlanIdx(planIdx); setShowRawCommands(false); setShowRbacRoles(false); }}
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
                        {/* Show details only for selected plan */}
                        {selectedPlanIdx === planIdx && (
                          <div style={{ marginTop: '8px', marginLeft: '24px' }}>
                            <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '13px', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                              {plan.description}
                            </Content>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: '10px', fontSize: '11px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                              <span>Created {plan.createdAt} by {plan.createdBy}</span>
                              <span style={{ color: 'var(--pf-t--global--border--color--default)' }}>|</span>
                              <Button variant="link" isInline style={{ fontSize: '11px', padding: 0 }}>
                                View plan details in AI hub
                              </Button>
                            </Flex>
                            <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }} style={{ marginBottom: '12px' }}>
                              <Label isCompact variant="outline">
                                Risk: {plan.risk}
                              </Label>
                              <Label isCompact variant="outline">
                                {plan.reversible ? 'Reversible' : 'Non-reversible'}
                              </Label>
                              {plan.requiresRbac && (
                                <Label isCompact variant="outline">
                                  Requires RBAC
                                </Label>
                              )}
                            </Flex>

                            {/* Progressive disclosure toggles */}
                            <Stack hasGutter>
                              {/* Raw commands toggle */}
                              <StackItem>
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={(e) => { e.stopPropagation(); setShowRawCommands(!showRawCommands); }}
                                  style={{ fontSize: '13px', paddingLeft: 0 }}
                                  icon={
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ transform: showRawCommands ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                                      <path d="M6 4l4 4-4 4z"/>
                                    </svg>
                                  }
                                >
                                  {showRawCommands ? 'Hide raw commands' : `Show raw commands (${plan.steps.length} lines)`}
                                </Button>
                                {showRawCommands && (
                                  <div style={{ marginTop: '8px' }}>
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
                                                      backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
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
                                  </div>
                                )}
                              </StackItem>

                              {/* RBAC roles toggle */}
                              {plan.requiresRbac && plan.rbacPermissions && (
                                <StackItem>
                                  <Button
                                    variant="link"
                                    isInline
                                    onClick={(e) => { e.stopPropagation(); setShowRbacRoles(!showRbacRoles); }}
                                    style={{ fontSize: '13px', paddingLeft: 0 }}
                                    icon={
                                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ transform: showRbacRoles ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                                        <path d="M6 4l4 4-4 4z"/>
                                      </svg>
                                    }
                                  >
                                    {showRbacRoles ? 'Hide RBAC roles' : `View ${plan.rbacPermissions.length} required RBAC role${plan.rbacPermissions.length !== 1 ? 's' : ''}`}
                                  </Button>
                                  {showRbacRoles && (
                                    <div style={{
                                      marginTop: '8px',
                                      borderRadius: '6px',
                                      border: '1px solid var(--pf-t--global--border--color--default)',
                                      overflow: 'hidden',
                                    }}>
                                      <div style={{
                                        padding: '10px 12px',
                                        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                                        borderBottom: '1px solid var(--pf-t--global--border--color--default)',
                                      }}>
                                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                                          <Icon size="sm" status="danger"><ExclamationCircleIcon /></Icon>
                                          <Content component="small" style={{ fontWeight: 600, fontSize: '12px', margin: 0 }}>
                                            Review before approving
                                          </Content>
                                        </Flex>
                                        <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '11px', lineHeight: '1.4', fontStyle: 'italic', margin: '6px 0 0 0' }}>
                                          These permissions are granted to the agent&apos;s execution sandbox and cannot be altered during execution.
                                        </Content>
                                      </div>
                                      <div style={{ padding: '10px 12px' }}>
                                        {plan.rbacPermissions.map((perm, permIdx) => (
                                          <div key={permIdx} style={{ marginTop: permIdx > 0 ? '10px' : 0 }}>
                                            <Content component="small" style={{ fontWeight: 600, fontSize: '11px', margin: '0 0 6px 0', display: 'block' }}>
                                              Namespace Scoped
                                            </Content>
                                            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '4px 10px', fontSize: '12px' }}>
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
                                </StackItem>
                              )}
                            </Stack>

                            {/* Test / Verification / Apply — inside selected plan card */}
                            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--pf-t--global--border--color--default)' }}>
                              {testState === 'idle' && (
                                <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleTestRemediation(); }}>
                                  Test Before Applying
                                </Button>
                              )}
                              {testState === 'testing' && (
                                <Button variant="secondary" isLoading isDisabled>
                                  Testing remediation plan
                                </Button>
                              )}
                              {testState === 'tested' && (
                                <Stack hasGutter>
                                  <StackItem>
                                    <div style={{
                                      backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                                      borderRadius: '8px',
                                      padding: '12px',
                                      border: '1px solid var(--pf-t--global--border--color--default)',
                                    }}>
                                      <Content component="small" style={{ fontWeight: 600, fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                                        Verification Step
                                      </Content>
                                      <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                                        <strong>Post-Remediation Check:</strong> Track disk utilization on{' '}
                                        <code style={{
                                          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                                          border: '1px solid var(--pf-t--global--border--color--default)',
                                          borderRadius: '3px',
                                          padding: '1px 4px',
                                          fontSize: '11px',
                                          fontFamily: 'var(--pf-t--global--font--family--mono)',
                                        }}>prod-api-server-04</code>{' '}
                                        for 5 min. Success: disk &lt; 75%, logrotate exit code 0.
                                      </Content>
                                      <Flex gap={{ default: 'gapMd' }} style={{ marginTop: '8px' }} alignItems={{ default: 'alignItemsCenter' }}>
                                        <Button variant="link" isInline style={{ fontSize: '12px' }} icon={<AiExperienceIcon />}>
                                          Discuss with LightSpeed
                                        </Button>
                                        <Button variant="link" isInline style={{ fontSize: '12px' }} icon={<DownloadIcon />}>
                                          Download remediation guide
                                        </Button>
                                      </Flex>
                                    </div>
                                  </StackItem>
                                  <StackItem>
                                    {affectedClusters.length > 1 ? (
                                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapNone' }}>
                                        <FlexItem>
                                          <Button variant="primary" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                                            Apply Remediation ({selectedClusters.size} of {affectedClusters.length + ineligibleClusters.length} clusters)
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
                                                Select all eligible clusters
                                              </DropdownItem>
                                              <DropdownItem key="deselect-all" onClick={() => setSelectedClusters(new Set())}>
                                                Deselect all
                                              </DropdownItem>
                                              <Divider component="li" />
                                              {affectedClusters.map((cluster) => (
                                                <DropdownItem key={cluster} onClick={(e) => { e.preventDefault(); toggleClusterSelection(cluster); }} style={{ padding: '8px 16px' }}>
                                                  <Checkbox
                                                    id={`cluster-card-${cluster}`}
                                                    label={cluster}
                                                    isChecked={selectedClusters.has(cluster)}
                                                    onChange={() => toggleClusterSelection(cluster)}
                                                    onClick={(e) => e.stopPropagation()}
                                                  />
                                                </DropdownItem>
                                              ))}
                                              {ineligibleClusters.map((cluster) => (
                                                <DropdownItem
                                                  key={cluster.name}
                                                  isDisabled
                                                  style={{ padding: '8px 16px' }}
                                                >
                                                  <Checkbox
                                                    id={`cluster-card-disabled-${cluster.name}`}
                                                    label={cluster.name}
                                                    isChecked={false}
                                                    isDisabled
                                                    onChange={() => {}}
                                                    body={<span style={{ fontSize: '11px', color: 'var(--pf-t--global--text--color--subtle)', display: 'block', marginTop: '2px' }}>{cluster.reason}</span>}
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
                                  </StackItem>
                                </Stack>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </StackItem>
                  ))}
                </Stack>
              </div>
            </ExpandableSection>
          </StackItem>
          )}
        </Stack>
      </div>

      {/* Fixed Footer - Disclaimer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--pf-t--global--border--color--default)',
        flexShrink: 0,
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
      }}>
        {!rootCauseAcknowledged && (
          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '12px', margin: '0 0 8px 0', display: 'block' }}>
            {analysisComplete ? 'Acknowledge the root cause analysis to proceed with remediation.' : 'Analysis in progress...'}
          </Content>
        )}
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <Icon size="sm" status="info"><InfoCircleIcon /></Icon>
          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '11px', margin: 0 }}>
            Always review AI-generated content prior to use.
          </Content>
        </Flex>
      </div>

    </div>
  );
};
