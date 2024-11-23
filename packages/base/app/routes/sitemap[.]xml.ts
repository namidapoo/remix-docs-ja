import { data } from 'react-router'
import { getProductById } from '~/features/product'
import { getMenu } from '~/services/menu.server'
import type { Route } from './+types/sitemap[.]xml'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const product = getProductById(__PRODUCT_ID__)
  if (!product) {
    throw data('Product not found', { status: 404 })
  }

  const siteRoot = product.url
  const slugs: string[] = []
  for (const category of await getMenu()) {
    if (category.children) {
      for (const item of category.children) {
        if (item.children.length === 0) {
          slugs.push(item.slug)
        }
        for (const subitem of item.children) {
          slugs.push(subitem.slug)
        }
      }
    }
  }
  const menu = (await getMenu())
    .flatMap((doc) => doc.children)
    .filter((doc) => doc.hasContent && doc.children.length === 0)

  const content = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${siteRoot}</loc>
        <priority>1.0</priority>
      </url>
      ${slugs
        .map((slug) => {
          return `<url><loc>${siteRoot}${slug}</loc></url>`
        })
        .join('\n')}
    </urlset>
  `

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  })
}
