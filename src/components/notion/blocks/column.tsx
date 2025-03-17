import type {BlockProps} from './types';

export function ColumnListBlock({block, renderBlocks}: BlockProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.isArray(block.children) &&
        block.children.map((col) => (
          <div key={col.id} className="min-w-0">
            {Array.isArray(col.children) && col.children.length > 0 ? renderBlocks(col.children) : null}
          </div>
        ))}
    </div>
  );
}

export function ColumnBlock({block, renderBlocks}: BlockProps) {
  return Array.isArray(block.children) && block.children.length > 0 ? <>{renderBlocks(block.children)}</> : null;
}
