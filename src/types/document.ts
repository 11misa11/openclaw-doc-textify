export type SourceType = 'url' | 'file'

export type TextifiedDocument = {
  title: string
  text: string
  markdown: string
  sourceType: SourceType
  sourcePathOrUrl: string
  fetchedAt: string
}
