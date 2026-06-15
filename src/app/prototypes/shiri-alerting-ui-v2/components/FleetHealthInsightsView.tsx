import * as React from 'react';
import { Flex, FlexItem, Title, Label, Button, Tooltip, Content } from '@patternfly/react-core';
import { MagicIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InfoCircleIcon, OptimizeIcon, HelpIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';

const AiTroubleshootIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M7 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    <path d="M4 9l.75 1.5L6.25 11.25l-1.5.75L4 13.5l-.75-1.5L1.75 11.25l1.5-.75L4 9z" />
    <path d="M25.4 5.1a5.5 5.5 0 00-6.7 1.2l-.2.2a5.5 5.5 0 00-.6 6.5L8.4 22.5a2.8 2.8 0 103.9 3.9l9.5-9.5a5.5 5.5 0 006.5-.6l.2-.2a5.5 5.5 0 001.2-6.7l-3.2 3.2-2.5-.6-.6-2.5 3.2-3.2zM10.3 25.7a1.2 1.2 0 11-1.7-1.7 1.2 1.2 0 011.7 1.7z" />
  </svg>
);

const AiExperienceIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1.5l1.5 3.2L13 6l-3.5 1.3L8 10.5 6.5 7.3 3 6l3.5-1.3L8 1.5z" />
    <path d="M12.5 9l.75 1.6 1.75.65-1.75.65-.75 1.6-.75-1.6L10 11.25l1.75-.65L12.5 9z" opacity=".7" />
    <path d="M4 11l.5 1.1 1.2.45-1.2.45L4 14.1l-.5-1.1-1.2-.45 1.2-.45L4 11z" opacity=".5" />
  </svg>
);
import {
  INSIGHTS_LIST_SIZE,
  INSIGHTS_LINK,
  getAlertAiInsight,
  getComponentAiInsight,
  getAlertActions,
  getComponentActions,
  INSIGHTS_LIST_WRAPPER,
  INSIGHTS_LIST_ITEM,
  INSIGHTS_LIST_ITEM_LAST,
  AI_INSIGHT_ICON_STYLE,
  AI_INSIGHT_TEXT_STYLE,
  FLEET_INSIGHT_CARD_STYLE,
  FLEET_INSIGHT_ICON_BOX_STYLE,
  FLEET_INSIGHT_TEXT_WRAPPER_STYLE,
} from '../data/fleetInsightsConfig';
import { OpenShiftLightspeedPanel, type LightspeedInvestigateContext } from './OpenShiftLightspeedPanel';

type SeverityKey = 'Critical' | 'Warning' | 'Info';

const SEVERITY_ICONS: Record<SeverityKey, React.ReactNode> = {
  Critical: <ExclamationCircleIcon />,
  Warning: <ExclamationTriangleIcon />,
  Info: <InfoCircleIcon />,
};

interface AlertRuleRow {
  name: string;
  critical: number;
  warning: number;
  info: number;
  clusters: string[];
}

interface ComponentRow {
  name: string;
  critical: number;
  warning: number;
  info: number;
  clusters: string[];
}

export interface FleetHealthInsightsViewProps {
  alertRuleData: AlertRuleRow[];
  componentInsightsTop5: ComponentRow[];
  componentCount: number;
  totalFiringAlertsCount: number;
  hasAlertData: boolean;
  onAlertRuleClick: (name: string) => void;
  onComponentClick: (name: string) => void;
  onViewAllFiringAlerts?: () => void;
  onViewAllClusters?: () => void;
  onInvestigateWithAi?: (alertName: string, severity: string, clusters: string[]) => void;
}

export const FleetHealthInsightsView: React.FC<FleetHealthInsightsViewProps> = (props) => {
  const {
    alertRuleData,
    componentInsightsTop5,
    componentCount,
    totalFiringAlertsCount,
    hasAlertData,
    onAlertRuleClick,
    onComponentClick,
    onViewAllFiringAlerts,
    onViewAllClusters,
    onInvestigateWithAi,
  } = props;

  const [lightspeedOpen, setLightspeedOpen] = React.useState(false);
  const [lightspeedContext, setLightspeedContext] = React.useState<LightspeedInvestigateContext | null>(null);

  const openLightspeed = React.useCallback((ctx: LightspeedInvestigateContext) => {
    setLightspeedContext(ctx);
    setLightspeedOpen(true);
  }, []);

  const closeLightspeed = React.useCallback(() => {
    setLightspeedOpen(false);
  }, []);

  if (!hasAlertData) {
    return (
      <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} style={{ flex: 1 }}>
        <Content component="p" className="pf-v6-u-color-200">No alerts</Content>
      </Flex>
    );
  }

  return (
    <>
      <OpenShiftLightspeedPanel isOpen={lightspeedOpen} onClose={closeLightspeed} context={lightspeedContext} />
      <div style={FLEET_INSIGHT_CARD_STYLE} role="region" aria-label="Fleet insight">
        <div style={FLEET_INSIGHT_ICON_BOX_STYLE} aria-hidden="true">
          <MagicIcon style={{ width: 20, height: 20 }} />
        </div>
        <div style={FLEET_INSIGHT_TEXT_WRAPPER_STYLE}>
          <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>Fleet Insight:</span>{' '}
          <span style={{ color: 'var(--pf-t--global--text--color--regular)' }}>
            Current pressure on <span style={{ color: '#c9190b', fontWeight: 500 }}>node availability</span> in 12 clusters points to a{' '}
            <Button variant="link" isInline style={{ padding: 0, fontSize: 'inherit', color: '#6753ac', textDecoration: 'underline' }}>VPC-peering bottleneck</Button> in{' '}
            <Button variant="link" isInline style={{ padding: 0, fontSize: 'inherit', color: '#6753ac', textDecoration: 'underline' }}>us-east-1</Button>.
          </span>
        </div>
      </div>
      <Title headingLevel="h3" size="lg" style={{ marginBottom: 6 }}>Top alerts</Title>
      <div style={{ ...INSIGHTS_LIST_WRAPPER, display: 'flex', flexDirection: 'column' }}>
        {alertRuleData.slice(0, INSIGHTS_LIST_SIZE).map((rule, index) => {
          const dominantSeverity: SeverityKey = rule.critical > 0 ? 'Critical' : rule.warning > 0 ? 'Warning' : 'Info';
          const clusterCount = rule.clusters.length;
          const isLast = index === Math.min(INSIGHTS_LIST_SIZE, alertRuleData.length) - 1;
          return (
            <div key={rule.name} style={{ ...INSIGHTS_LIST_ITEM, ...(isLast ? INSIGHTS_LIST_ITEM_LAST : {}) }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                <FlexItem style={{ flexShrink: 0 }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <Label isCompact color={dominantSeverity === 'Critical' ? 'red' : dominantSeverity === 'Warning' ? 'orange' : 'purple'} icon={SEVERITY_ICONS[dominantSeverity]}>{dominantSeverity}</Label>
                    <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>{rule.name}</span>
                    <span style={{ fontWeight: 400, color: 'var(--pf-t--global--text--color--subtle)' }}>{clusterCount} cluster{clusterCount !== 1 ? 's' : ''}</span>
                  </Flex>
                </FlexItem>
                <FlexItem style={{ flexShrink: 0 }}>
                  <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                    {getAlertActions(rule.name).map((action) => (
                      <Button key={action.label} variant="link" isInline style={INSIGHTS_LINK} className="pf-v6-u-font-size-sm" onClick={action.onClick}
                        {...(action.label.toLowerCase().includes('runbook') ? { icon: <ExternalLinkAltIcon />, iconPosition: 'end' as const } : {})}
                      >{action.label}</Button>
                    ))}
                    <Button variant="link" isInline style={INSIGHTS_LINK} className="pf-v6-u-font-size-sm" onClick={() => onAlertRuleClick(rule.name)}>View alert</Button>
                  </Flex>
                </FlexItem>
              </Flex>
              <Flex alignItems={{ default: 'alignItemsFlexStart' }} gap={{ default: 'gapXs' }} style={{ marginTop: 6, width: '100%' }} role="note" aria-label="AI insight">
                <span style={AI_INSIGHT_ICON_STYLE} aria-hidden="true"><AiExperienceIcon size={14} /></span>
                <span style={{ fontSize: 'var(--pf-t--global--font--size--sm)', minWidth: 0, flex: 1, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--subtle)' }}>AI insight: </span>
                  <span style={AI_INSIGHT_TEXT_STYLE}>{getAlertAiInsight(rule.name)}</span>{' '}
                  <Button
                    variant="link"
                    isInline
                    className="pf-v6-u-font-size-sm"
                    style={{ ...INSIGHTS_LINK, padding: 0, verticalAlign: 'baseline' }}
                    icon={<AiTroubleshootIcon size={14} />}
                    onClick={() => {
                      const dominantSev = rule.critical > 0 ? 'Critical' : rule.warning > 0 ? 'Warning' : 'Info';
                      if (onInvestigateWithAi) {
                        onInvestigateWithAi(rule.name, dominantSev, rule.clusters);
                      } else {
                        openLightspeed({
                          sourceType: 'alert',
                          sourceName: rule.name,
                          aiInsightText: getAlertAiInsight(rule.name),
                        });
                      }
                    }}
                  >
                    {rule.name.toLowerCase().includes('cpu') || rule.name.toLowerCase().includes('memory') || rule.name.toLowerCase().includes('nodenotready') ? 'View AI investigation' : 'Investigate with AI'}
                  </Button>
                </span>
              </Flex>
            </div>
          );
        })}
      </div>
      {totalFiringAlertsCount > 0 && (
        <div className="pf-v6-u-pt-md" style={{ paddingBottom: 24 }}>
          <Button variant="link" isInline onClick={() => onViewAllFiringAlerts?.()} isDisabled={!onViewAllFiringAlerts}>View all firing alerts ({totalFiringAlertsCount})</Button>
        </div>
      )}
      {componentInsightsTop5.length > 0 && (
        <>
          <Flex gap={{ default: 'gapXs' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 6 }}>
            <Title headingLevel="h3" size="lg">Most affected components</Title>
            <Tooltip content="Kubernetes subsystems (such as kube-apiserver, etcd, kubelet) with active firing alerts.">
              <Button variant="plain" aria-label="More info about affected components" icon={<HelpIcon />} />
            </Tooltip>
          </Flex>
          <div style={{ ...INSIGHTS_LIST_WRAPPER, display: 'flex', flexDirection: 'column' }}>
            {componentInsightsTop5.map((comp, index) => {
              const dominantSeverity: SeverityKey = comp.critical > 0 ? 'Critical' : comp.warning > 0 ? 'Warning' : 'Info';
              const clusterCount = comp.clusters.length;
              const isLast = index === componentInsightsTop5.length - 1;
              return (
                <div key={comp.name} style={{ ...INSIGHTS_LIST_ITEM, ...(isLast ? INSIGHTS_LIST_ITEM_LAST : {}) }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
                    <FlexItem style={{ flexShrink: 0 }}>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <Label isCompact color={dominantSeverity === 'Critical' ? 'red' : dominantSeverity === 'Warning' ? 'orange' : 'purple'} icon={SEVERITY_ICONS[dominantSeverity]}>{dominantSeverity}</Label>
                        <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>{comp.name}</span>
                        <span style={{ fontWeight: 400, color: 'var(--pf-t--global--text--color--subtle)' }}>{clusterCount} cluster{clusterCount !== 1 ? 's' : ''}</span>
                      </Flex>
                    </FlexItem>
                    <FlexItem style={{ flexShrink: 0 }}>
                      <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                        {getComponentActions(comp.name).map((action) => (
                          <Button key={action.label} variant="link" isInline style={INSIGHTS_LINK} className="pf-v6-u-font-size-sm" onClick={action.onClick}
                            {...(action.label.toLowerCase().includes('runbook') ? { icon: <ExternalLinkAltIcon />, iconPosition: 'end' as const } : {})}
                          >{action.label}</Button>
                        ))}
                        <Button variant="link" isInline style={INSIGHTS_LINK} className="pf-v6-u-font-size-sm" onClick={() => onComponentClick(comp.name)}>View alert</Button>
                      </Flex>
                    </FlexItem>
                  </Flex>
                  <Flex alignItems={{ default: 'alignItemsFlexStart' }} gap={{ default: 'gapXs' }} style={{ marginTop: 6, width: '100%' }} role="note" aria-label="AI insight">
                    <span style={AI_INSIGHT_ICON_STYLE} aria-hidden="true"><AiExperienceIcon size={14} /></span>
                    <span style={{ fontSize: 'var(--pf-t--global--font--size--sm)', minWidth: 0, flex: 1, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600, color: 'var(--pf-t--global--text--color--subtle)' }}>AI insight: </span>
                      <span style={AI_INSIGHT_TEXT_STYLE}>{getComponentAiInsight(comp.name)}</span>
                    </span>
                  </Flex>
                </div>
              );
            })}
          </div>
          {componentCount > 0 && (
            <div className="pf-v6-u-pt-md pf-v6-u-pb-sm">
              <Button variant="link" isInline onClick={() => onViewAllClusters?.()} isDisabled={!onViewAllClusters}>View all affected components ({componentCount})</Button>
            </div>
          )}
        </>
      )}
    </>
  );
};
