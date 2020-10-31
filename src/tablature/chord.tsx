import React, { PureComponent } from 'react';

export class Chord extends PureComponent<IChordProps, IChordState> {
  render(): JSX.Element {
    const needsBar = this.props.notesPerMeasure !== null
      && this.props.notesPerMeasure !== 0
      && ((this.props.chordIndex + 1) % this.props.notesPerMeasure === 0);

    const fretElements: JSX.Element[] = this.props.notes.map((fret: number | null, stringIndex: number) => {
      return this.getFretElement(stringIndex, fret);
    });

    return (
      <>
        <div className='chord'>
          {fretElements}
        </div>
        {needsBar ? <div className='bar'> </div> : null}
      </>
    );
  }

  private getFretElement(stringIndex: number, fret: number | null): JSX.Element {
    const isFocused: boolean = stringIndex === this.props.focusedStringIndex;
    const className: string = 'fret' + (isFocused ? ' blink' : '');

    const fretNumDisplay = fret === null
      ? <span>{isFocused ? '_' : '-'}</span> :
      <span>{fret}</span>;

    const key: string = `${stringIndex}|${fret === null ? '' : fret}`;

    return (
      <div
        className={className}
        key={key}
        onClick={e => this.props.onNoteClick(this.props.chordIndex, stringIndex, e)}>
        {fretNumDisplay}
      </div>
    );
  }
}

export interface IChordProps {
  chordIndex: number;
  focusedStringIndex: number | null;
  notes: (number | null)[];
  notesPerMeasure: number | null;
  onNoteClick: (chordIndex: number, stringIndex: number, e: React.MouseEvent) => void;
}

interface IChordState { }