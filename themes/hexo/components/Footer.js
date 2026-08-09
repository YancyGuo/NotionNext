import { BeiAnGongAn } from '@/components/BeiAnGongAn'
import BeiAnSite from '@/components/BeiAnSite'
import PoweredBy from '@/components/PoweredBy'
import { siteConfig } from '@/lib/config'
import HeroTitle from './HeroTitle'

const REPOSITORY_URL = 'https://github.com/YancyGuo/NotionNext'

const Footer = ({ title }) => {
  const d = new Date()
  const currentYear = d.getFullYear()
  const since = siteConfig('SINCE')
  const copyrightDate =
    parseInt(since) < currentYear ? since + '-' + currentYear : currentYear
  const bio = siteConfig('BIO')

  return (
    <footer className='hexo-footer relative z-10 flex-shrink-0 justify-center text-center m-auto w-full leading-6 text-gray-600 text-sm p-6'>
      <div className='hexo-footer__inner'>
        <div className='hexo-footer__meta'>
          <span className='hexo-footer__copyright'>
            <i className='fas fa-copyright' /> {`${copyrightDate}`}
          </span>

          <span className='hexo-footer__author'>
            <span className='hexo-footer__separator' aria-hidden='true'>
              |
            </span>
            <i className='mx-1 animate-pulse fas fa-heart' />
            <a href={siteConfig('LINK')} className='underline font-bold'>
              {siteConfig('AUTHOR')}
            </a>
            .
          </span>

          <span className='hidden busuanzi_container_site_pv hexo-footer__metric'>
            <span className='hexo-footer__separator' aria-hidden='true'>
              |
            </span>
            <i className='fas fa-eye' />
            <span className='px-1 busuanzi_value_site_pv'> </span>
          </span>

          <span className='hidden busuanzi_container_site_uv hexo-footer__metric'>
            <span className='hexo-footer__separator' aria-hidden='true'>
              |
            </span>
            <i className='fas fa-users' />
            <span className='px-1 busuanzi_value_site_uv'> </span>
          </span>
        </div>

        <div className='hexo-footer__registrations'>
          <BeiAnSite />
          <BeiAnGongAn />
        </div>

        <div className='hexo-footer__brand'>
          <HeroTitle
            title={title}
            className='hero-brand--footer'
            invertHalo={false}
          />
        </div>

        <div className='hexo-footer__details'>
          {bio && <p className='hexo-footer__bio'>{bio}</p>}
          {bio && (
            <span className='hexo-footer__separator' aria-hidden='true'>
              |
            </span>
          )}
          <PoweredBy repositoryUrl={REPOSITORY_URL} />
        </div>
      </div>
    </footer>
  )
}

export default Footer
