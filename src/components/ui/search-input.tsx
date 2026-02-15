import {SearchIcon} from 'lucide-react';

import {Input} from '@/components/ui/input';
import {cn} from '@/utils/style';

function SearchInput({className, ...props}: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
      <Input type="search" className={cn('pl-9', className)} {...props} />
    </div>
  );
}

export {SearchInput};
