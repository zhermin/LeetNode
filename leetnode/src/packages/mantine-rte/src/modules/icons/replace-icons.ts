// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const CLEANUP = [
  'list',
  'strike',
  'underline',
  'link',
  'bold',
  'italic',
  'image',
  'clean',
  'align',
  'video',
  'header',
  'script',
  'blockquote',
  'code',
  'code-block',
  'formula',
];

export function replaceIcons(quillIconsModule: unknown) {
  CLEANUP.forEach((icon) => {
    // eslint-disable-next-line no-param-reassign
    quillIconsModule[icon] = {};
  });
}
