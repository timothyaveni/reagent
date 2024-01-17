import {
  CursorOverlayData,
  // CursorOverlayData,
  useRemoteCursorOverlayPositions,
} from '@slate-yjs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CaretPosition } from 'node_modules/@slate-yjs/react/dist/utils/getOverlayPosition';
import { useSlateStatic } from 'slate-react';
import './Cursors.css';

type CursorsProps = {
  children: React.ReactNode;
};

export type CursorData = {
  name: string;
  color: string;
};

export function Cursors({ children }: CursorsProps) {
  const containerRef = useRef(null);
  const [cursors] = useRemoteCursorOverlayPositions<CursorData>({
    containerRef,
  });
  const editor = useSlateStatic();

  // it turns out Cursors won't rerender if someone else types in the middle of the doc, because
  // this gets dispatched as a 'local' event (long story). the official doc example is actually
  // rerendering the parent editor component on every change. this feels slightly more responsible?
  // does it make a difference? idk
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);
  useEffect(() => {
    const editorOnChange = editor.onChange;

    editor.onChange = () => {
      editorOnChange();
      forceUpdate();
    };

    return () => {
      editor.onChange = editorOnChange;
    };
  }, [editor]);

  return (
    <div className="cursors" ref={containerRef}>
      {children}
      {cursors.map((cursor) => (
        <Selection key={cursor.clientId} {...cursor} />
      ))}
    </div>
  );
}

function Selection({
  data,
  selectionRects,
  caretPosition,
}: CursorOverlayData<CursorData>) {
  if (!data) {
    return null;
  }

  const selectionStyle = {
    backgroundColor: data.color,
  };

  return (
    <>
      {selectionRects.map((position, i) => (
        <div
          style={{ ...selectionStyle, ...position }}
          className="selection"
          key={i}
        />
      ))}
      {caretPosition && <Caret caretPosition={caretPosition} data={data} />}
    </>
  );
}

function Caret({
  caretPosition,
  data,
}: {
  caretPosition: CaretPosition;
  data: CursorData;
}) {
  const caretStyle = {
    ...caretPosition,
    background: data?.color,
  };

  const labelStyle = {
    transform: 'translateY(-100%)',
    background: data?.color,
  };

  return (
    <div style={caretStyle} className="caretMarker">
      <div className="caret" style={labelStyle}>
        {data?.name}
      </div>
    </div>
  );
}
