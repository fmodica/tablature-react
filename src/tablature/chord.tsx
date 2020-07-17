import React, { Component } from 'react';

export class Chord extends Component<IChordProps, IChordState> {
  render(): JSX.Element {
    const fretElements: JSX.Element[] = this.props.notes.map((fret, stringIndex) => {
      return <div key={stringIndex}>{this.getFretElement(stringIndex, fret)}</div>;
    });

    return (
      <div className='chord'>
        {fretElements}
      </div>
    );
  }

  shouldComponentUpdate(nextProps: Readonly<IChordProps>): boolean {
    return this.props.indexOfFocusedString !== nextProps.indexOfFocusedString
      || this.props.notes !== nextProps.notes;
  }

  private getFretElement(stringIndex: number, fret: number | null): JSX.Element {
    const isFocused = stringIndex === this.props.indexOfFocusedString;
    const className = 'fret' + (isFocused ? ' blink' : '');

    const fretNumDisplay = fret === null
      ? <span>{isFocused ? '_' : '-'}</span> :
      fret;

    return (
      <div
        className={className}
        onClick={e => this.props.onNoteClick(stringIndex, e)}
        onContextMenu={e => this.props.onNoteRightClick(stringIndex, e)}>
        {fretNumDisplay}
      </div>
    );
  }
}

export interface IChordProps {
  indexOfFocusedString: number | null;
  notes: (number | null)[];
  onNoteClick: (stringIndex: number, e: React.MouseEvent) => void;
  onNoteRightClick: (stringIndex: number, e: React.MouseEvent) => void;
}

interface IChordState { }