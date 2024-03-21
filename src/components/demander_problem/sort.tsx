import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { Dispatch, SetStateAction, useState } from 'react';

interface DataType {
  key:number;
  content: string;
}

function moveElement(arr: any[], fromIndex: number, toIndex: number) {
  arr = [...arr]
  if(fromIndex<toIndex) {
    const temp = arr[fromIndex];
    for(let i=fromIndex+1;i<=toIndex;i++) {
      arr[i-1] = arr[i]
    }
    arr[toIndex] = temp;
  } else if (fromIndex>toIndex) {
    const temp = arr[fromIndex];
    for(let i=fromIndex-1;i>=toIndex;i--) {
      arr[i+1] = arr[i]
    }
    arr[toIndex] = temp;
  }
  return [...arr];
}

function indexOf(arr: {key: number, content: string}[], key: number) {
  for(let i=0;i<arr.length;i++) {
    if(arr[i].key===key) {
      return i;
    }
  }
  return -1;
}


const columns: ColumnsType<DataType> = [
  {
    title: 'content',
    dataIndex: 'content',
  },
];

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row = (props: RowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
};


interface SortProps {
  problemList: any[];
  index: number;
  setProblemList: Dispatch<SetStateAction<any[]>>;
}

const Sort = (props: SortProps) => {
  const [dataSource, setDataSource] = useState<any[]>(props.problemList[props.index].data);
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const newProblems = [...props.problemList];
      newProblems[props.index].data = moveElement(newProblems[props.index].data, indexOf(newProblems[props.index].data, active.id as number), indexOf(newProblems[props.index].data, over?.id as number));
      props.setProblemList(newProblems);
      setDataSource((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id);
        const overIndex = prev.findIndex((i) => i.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <SortableContext
        items={dataSource.map((i) => i.key)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          components={{
            body: {
              row: Row,
            },
          }}
          rowKey="key"
          columns={columns}
          dataSource={dataSource}
        />
      </SortableContext>
    </DndContext>
  );
};

export default Sort;