import React, { PureComponent } from 'react';

export class Chord extends PureComponent<IChordProps, IChordState> {
  render(): JSX.Element {
    const needsBar = this.props.notesPerMeasure !== null
      && this.props.notesPerMeasure !== 0
      && ((this.props.chordIndex + 1) % this.props.notesPerMeasure === 0);

    const fretElements: JSX.Element[] = this.props.notes.map((fret: number | null, stringIndex: number) => {
      const cssClass = `fret-container ${needsBar ? 'bar' : ''}`;

      return (
        <div className={cssClass} key={stringIndex}>{this.getFretElement(stringIndex, fret)}</div>
      );
    });

    return (
      <div className='chord'>
        {fretElements}
      </div>
    );
  }

  private getFretElement(stringIndex: number, fret: number | null): JSX.Element {
    const isFocused: boolean = stringIndex === this.props.focusedStringIndex;
    const className: string = 'fret' + (isFocused ? ' blink' : '');

    const fretNumDisplay = fret === null
      ? <span>{isFocused ? '_' : '-'}</span> :
      fret;

    return (
      <div
        className={className}
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