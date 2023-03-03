// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

interface Range {
  index: number;
  length: number;
}

interface Context {
  format: Record<string, unknown>;
}

export function attachShortcuts(keyboardModule: unknown) {
  ['1', '2', '3', '4', '5', '6'].forEach((key) => {
    keyboardModule.addBinding(
      {
        key,
        shortKey: true,
        altKey: true,
      },
      function toggleHeader(range: Range, context: Context) {
        if (context.format?.header === Number(key)) {
          this.quill.removeFormat(range);
        } else {
          this.quill.formatLine(range, 'header', key);
        }
      }
    );
  });
}
