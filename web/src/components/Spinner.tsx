import { MoreHorizontal } from 'lucide-react';

export default function Spinner() {
  return (
    <div className="flex justify-center items-center h-12">
      <MoreHorizontal className="w-8 h-8 animate-pulse" />
    </div>
  );
}
