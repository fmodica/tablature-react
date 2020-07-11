import React, { Component } from 'react';
import './tablature.css';

export class Tablature extends Component<ITablatureProps, ITablatureState> {
  render(): JSX.Element {
    const tuningDisplay = this.getTuningDisplay();
    const chordsDisplay = this.getChordsDisplay();

    return (
      <div className='tablature'>
        <div className='chord tuning'>
          {tuningDisplay}
        </div>
        <div className='chord-display'>
          {chordsDisplay}
        </div>
      </div>
    );
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  private getTuningDisplay(): JSX.Element[] {
    return this.props.tuning.map((tuningNote, index) => {
      return <div className='fret' key={index}>{this.props.mapFromNoteLetterEnumToString.get(tuningNote.letter)}</div>;
    });
  }

  private getChordsDisplay(): JSX.Element[] {
    return this.props.chords.map((chord, index) => {
      return this.getChordDisplay(chord, index);
    });
  }

  private getChordDisplay(chord: (number | null)[], chordIndex: number): JSX.Element {
    const fretsDisplay = this.getFretsDisplay(chord, chordIndex);

    return (
      <div className='chord' key={chordIndex}>
        {fretsDisplay}
      </div>
    );
  }

  private getFretsDisplay(chord: (number | null)[], chordIndex: number): React.ReactNode {
    return chord.map((fret, stringIndex) => {
      return this.getFretDisplay(chordIndex, stringIndex, fret);
    });
  }

  private getFretDisplay(chordIndex: number, stringIndex: number, fret: number | null): JSX.Element {
    const isFocused = this.props.focusedNote.chordIndex === chordIndex && this.props.focusedNote.stringIndex === stringIndex;
    const className = 'fret' + (isFocused ? ' blink' : '');

    const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
      this.props.onFretRightClick(chordIndex, stringIndex, e.clientX, e.clientY);
    };

    const onClick = () => this.props.onFretClick(chordIndex, stringIndex);

    const fretNumDisplay = fret === null
      ? <span>{isFocused ? '_' : '-'}</span> :
      fret;

    return (
      <div className={className} key={stringIndex} onClick={onClick} onContextMenu={onContextMenu}>
        {fretNumDisplay}
      </div>
    );
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    // Insert
    if (event.keyCode === 45 && event.shiftKey) {
      let newChords = [...this.props.chords];
      newChords.splice(this.props.focusedNote.chordIndex + 1, 0, this.getAllNulls(6));

      this.props.onEdit(newChords, this.props.focusedNote);
    }
    // Delete / Backspace
    else if (event.keyCode === 46 || event.keyCode === 8) {
      if (event.shiftKey) {
        this.clearCurrentlyFocusedChord();
      } else {
        this.clearCurrentlyFocusedNote();
      }
    }
    // Left
    else if (event.keyCode === 37) {
      this.goLeft();
    }
    // Right
    else if (event.keyCode === 39) {
      this.goRight();
    }
    // Up
    else if (event.keyCode === 38) {
      this.goUp();
    }
    // Down
    else if (event.keyCode === 40) {
      this.goDown();
    } else {
      this.onFretType(event.key);
    }
  }

  private clearCurrentlyFocusedChord = (): void => {
    if (this.props.chords.length === 1) {
      return;
    }

    const newChords = [...this.props.chords];
    newChords.splice(this.props.focusedNote.chordIndex, 1);

    const newFocusedNote = { ...this.props.focusedNote };

    if (this.props.focusedNote.chordIndex === this.props.chords.length - 1) {
      newFocusedNote.chordIndex--;
    }

    this.props.onEdit(newChords, newFocusedNote);
  }

  private clearCurrentlyFocusedNote = (): void => {
    const newChords = [...this.props.chords];
    const newChord = [...newChords[this.props.focusedNote.chordIndex]];

    newChord[this.props.focusedNote.stringIndex] = null;
    newChords[this.props.focusedNote.chordIndex] = newChord;

    this.props.onEdit(newChords, this.props.focusedNote);
  }

  private goUp = (): void => {
    const newFocusedNote = { ...this.props.focusedNote };

    newFocusedNote.stringIndex = newFocusedNote.stringIndex === 0
      ? this.props.tuning.length - 1
      : newFocusedNote.stringIndex - 1;

    this.props.onFocusedNoteChange(newFocusedNote);
  }

  private goRight = (): void => {
    const newFocusedNote = { ...this.props.focusedNote };

    newFocusedNote.chordIndex = newFocusedNote.chordIndex === this.props.chords.length - 1
      ? 0
      : newFocusedNote.chordIndex + 1;

    this.props.onFocusedNoteChange(newFocusedNote);
  }

  private goDown = (): void => {
    const newFocusedNote = { ...this.props.focusedNote };

    newFocusedNote.stringIndex = newFocusedNote.stringIndex === this.props.tuning.length - 1
      ? 0
      : newFocusedNote.stringIndex + 1;

    this.props.onFocusedNoteChange(newFocusedNote);
  }

  private goLeft = (): void => {
    const newFocusedNote = { ...this.props.focusedNote };

    newFocusedNote.chordIndex = newFocusedNote.chordIndex === 0
      ? this.props.chords.length - 1
      : newFocusedNote.chordIndex - 1;

    this.props.onFocusedNoteChange(newFocusedNote);
  }

  private onFretType = (text: string): void => {
    if (text.trim() === '') {
      this.clearCurrentlyFocusedNote();
      return;
    }

    const newChords = [...this.props.chords];
    const newChord = [...newChords[this.props.focusedNote.chordIndex]];
    const newFretNum = this.getNewFretNumber(newChord, text);

    if (!Number.isInteger(newFretNum)) {
      return;
    }

    if (newFretNum <= this.props.maxFretNum) {
      newChord[this.props.focusedNote.stringIndex] = newFretNum;
    } else {
      // If the new fret number is an integer, then the text must be an integer too
      newChord[this.props.focusedNote.stringIndex] = parseInt(text);
    }

    newChords[this.props.focusedNote.chordIndex] = newChord;

    this.props.onEdit(newChords, this.props.focusedNote);
  }

  private getNewFretNumber = (chord: (number | null)[], typedText: string): number => {
    const currentFretAsNumber: (number | null) = chord[this.props.focusedNote.stringIndex];

    const currentFretAsString: string = currentFretAsNumber === null
      ? ''
      : currentFretAsNumber.toString();

    const newFret = currentFretAsString + typedText;
    const newFretAsNumber = parseInt(newFret);

    return newFretAsNumber;
  }

  private getAllNulls = (numFrets: number): null[] => {
    return new Array(numFrets).fill(null);
  }
};

export enum NoteLetter {
  C,
  Csharp,
  D,
  Eflat,
  E,
  F,
  Fsharp,
  G,
  Aflat,
  A,
  Bflat,
  B
}

export interface INote {
  letter: NoteLetter;
  octave: number;
}

interface ITablatureState { }

export interface ITablatureProps {
  chords: (number | null)[][];
  tuning: INote[];
  maxFretNum: number;
  mapFromNoteLetterEnumToString: Map<NoteLetter, string>;
  focusedNote: ITabNoteLocation;
  onFocusedNoteChange: (focusedNote: ITabNoteLocation) => void;
  onEdit: (chords: (number | null)[][], focusedNote: ITabNoteLocation) => void;
  onFretClick: (clickedChordIndex: number, clickedStringIndex: number) => void;
  onFretRightClick: (clickedChordIndex: number, clickedStringIndex: number, x: number, y: number) => void;
}

export interface ITabNoteLocation {
  chordIndex: number;
  stringIndex: number;
}