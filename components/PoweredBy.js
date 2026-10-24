import { siteConfig } from '@/lib/config'

/**
 * 驱动版权
 * @returns
 */
export default function PoweredBy({
  className,
  repositoryUrl = 'https://github.com/notionnext-org/NotionNext'
}) {
  return (
    <div className={`inline text-sm font-serif ${className || ''}`}>
      <span className='mr-1'>Powered by</span>
      <a href={repositoryUrl} className='underline justify-start'>
        NotionNext {siteConfig('VERSION')}
      </a>
      .
    </div>
  )
}
