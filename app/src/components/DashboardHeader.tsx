'use client'

import PageInfoTooltip from './PageInfoTooltip'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  tooltipTitle: string
  tooltipDescription: string
  tooltipTips?: string[]
}

export default function DashboardHeader({
  title,
  subtitle,
  tooltipTitle,
  tooltipDescription,
  tooltipTips
}: DashboardHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      <PageInfoTooltip
        title={tooltipTitle}
        description={tooltipDescription}
        tips={tooltipTips}
      />
    </div>
  )
}
