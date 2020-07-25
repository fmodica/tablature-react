import React, { PureComponent } from 'react';

export class Chord extends PureComponent<IChordProps, IChordState> {
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

  private getFretElement(stringIndex: number, fret: number | null): JSX.Element {
    const isFocused: boolean = stringIndex === this.props.indexOfFocusedString;
    const className: string = 'fret' + (isFocused ? ' blink' : '');

    const fretNumDisplay = fret === null
      ? <span>{isFocused ? '_' : '-'}</span> :
      fret;

    return (
      <div
        className={className}
        onClick={e => this.props.onNoteClick(this.props.chordIndex, stringIndex, e)}
        onContextMenu={e => this.props.onNoteRightClick(this.props.chordIndex, stringIndex, e)}>
        {fretNumDisplay}
      </div>
    );
  }
}

export interface IChordProps {
  chordIndex: number;
  indexOfFocusedString: number | null;
  notes: (number | null)[];
  onNoteClick: (chordIndex: number, stringIndex: number, e: React.MouseEvent) => void;
  onNoteRightClick: (chordIndex: number, stringIndex: number, e: React.MouseEvent) => void;
}

interface IChordState { }