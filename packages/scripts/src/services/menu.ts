import fg from 'fast-glob'
import parseYamlHeader from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface MenuDocAttributes {
  title: string
  order?: number
  new?: boolean
  [key: string]: unknown
}

export interface MenuDoc {
  attrs: MenuDocAttributes
  parentSlug?: string
  children: MenuDoc[]
  filename: string
  hasContent: boolean
  slug: string
}

const makeSlug = (filepath: string) => {
  const regexp = /^(.+\/)?docs/
  return filepath
    .replace(regexp, '')
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
    .replace(/\/$/, '')
}

const parseAttrs = (
  filepath: string,
  md: string,
): {
  content: string
  attrs: { title: string } & Record<string, unknown>
} => {
  const filename = path.basename(filepath, '.md')
  const { data, content } = parseYamlHeader(md)
  return {
    content,
    attrs: {
      title: filename,
      ...data,
    },
  }
}

export const buildMenu = async () => {
  const docs: MenuDoc[] = []
  const files = await fg('docs/**/*.md', { onlyFiles: true })
  for (const filename of files) {
    const content = await fs.readFile(filename, 'utf-8')
    const { attrs, content: md } = parseAttrs(filename, content)
    const slug = makeSlug(filename)

    // don't need docs/index.md in the menu
    if (slug === '') continue

    // can have docs not in the menu
    if (attrs.hidden) continue

    docs.push({
      attrs,
      filename,
      slug: makeSlug(filename),
      hasContent: md.length > 0,
      children: [],
    })
  }
  // sort so we can process parents before children
  docs.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))

  // construct the hierarchy
  const tree: MenuDoc[] = []
  const map = new Map<string, MenuDoc>()
  for (const doc of docs) {
    const { slug } = doc

    const parentSlug = slug.substring(0, slug.lastIndexOf('/'))
    map.set(slug, doc)

    if (parentSlug) {
      const parent = map.get(parentSlug)
      if (parent) {
        doc.parentSlug = parent.slug
        parent.children.push(doc)
      }
    } else {
      tree.push(doc)
    }
  }

  const sortDocs = (a: MenuDoc, b: MenuDoc) =>
    (a.attrs.order || Number.POSITIVE_INFINITY) -
    (b.attrs.order || Number.POSITIVE_INFINITY)

  // sort the parents and children
  tree.sort(sortDocs)
  for (const category of tree) {
    category.children.sort(sortDocs)
    for (const subItems of category.children) {
      subItems.children.sort(sortDocs)
    }
  }
  return tree
}
