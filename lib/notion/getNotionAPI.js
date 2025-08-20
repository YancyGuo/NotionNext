import { NotionAPI as NotionLibrary } from 'notion-client'
import BLOG from '@/blog.config'

const notionAPI = getNotionAPI()

function getNotionAPI() {
  return new NotionLibrary({
    activeUser: BLOG.NOTION_ACTIVE_USER || null,
    authToken: BLOG.NOTION_TOKEN_V2 || null,
    userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    // 修复 Notion API v3 端点变更问题
    gotOptions: {
      hooks: {
        beforeRequest: [
          (options) => {
            // 将废弃的 syncRecordValues 端点重定向到新的 syncRecordValuesMain
            if (options.url.pathname === "/api/v3/syncRecordValues") {
              options.url.pathname = "/api/v3/syncRecordValuesMain";
            }
          },
        ],
      },
    }
  })
}

export default notionAPI
