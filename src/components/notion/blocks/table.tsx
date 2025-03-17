import {NotionRichText} from '../notion-rich-text';

import type {BlockProps, NarrowBlock} from './types';

export function TableBlock({block}: BlockProps) {
  const b = block as NarrowBlock<'table'>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {Array.isArray(block.children) &&
            block.children.map((row, rowIdx) => {
              const tableRow = (row as NarrowBlock<'table_row'>).table_row;
              return (
                <tr key={row.id} className={rowIdx === 0 && b.table.has_column_header ? 'font-semibold' : ''}>
                  {Array.isArray(tableRow?.cells) &&
                    tableRow.cells.map((cell, cellIdx) => {
                      const Tag = rowIdx === 0 && b.table.has_column_header ? 'th' : 'td';
                      return (
                        <Tag key={cellIdx} className="border px-3 py-2 text-left">
                          <NotionRichText richText={cell} />
                        </Tag>
                      );
                    })}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
