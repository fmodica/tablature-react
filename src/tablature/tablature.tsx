import React, { Component, Key } from 'react';
import './tablature.css';

export class Tablature extends Component<ITablatureProps, ITablatureState> {
  constructor(props: ITablatureProps) {
    super(props);

    this.state = { editorIsFocused: false };
  }

  render(): JSX.Element {
    const tuningDisplay = this.getTuningDisplay();
    const chordsDisplay = this.getChordsDisplay();

    // To get around TS errors
    const tabIndexAttr = { tabIndex: 0 };

    return (
      <div className='tablature-container'>
        <div className='tablature' {...tabIndexAttr} onFocus={this.onFocus} onBlur={this.onBlur}>
          {tuningDisplay}
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

  private getTuningDisplay(): JSX.Element {
    const fretsDisplay = this.props.tuning.map((tuningNote, index) => {
      return <div className='fret' key={index}>{this.props.mapFromNoteLetterEnumToString.get(tuningNote.letter)}</div>;
    });

    return (
      <div className='chord tuning'>
        {fretsDisplay}
      </div>
    );
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
    const isFocused = this.state.editorIsFocused &&
      this.props.focusedNote.chordIndex === chordIndex &&
      this.props.focusedNote.stringIndex === stringIndex;

    const onContextMenu = (e: React.MouseEvent) => {
      const newFocusedNote: ITabNoteLocation = {
        chordIndex: chordIndex,
        stringIndex: stringIndex
      };

      this.props.onNoteRightClick(newFocusedNote, e);
    };

    const onClick = (e: React.MouseEvent) => {
      const newFocusedNote: ITabNoteLocation = {
        chordIndex: chordIndex,
        stringIndex: stringIndex
      };

      this.props.onNoteClick(newFocusedNote, e);
    };

    const className = 'fret' + (isFocused ? ' blink' : '');

    const fretNumDisplay = fret === null
      ? <span>{isFocused ? '_' : '-'}</span> :
      fret;

    return (
      <div className={className} key={stringIndex} onClick={onClick} onContextMenu={onContextMenu}>
        {fretNumDisplay}
      </div>
    );
  }

  private onFocus = (): void => {
    this.setState({ editorIsFocused: true });
  }

  private onBlur = (): void => {
    this.setState({ editorIsFocused: false });
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.state.editorIsFocused) {
      return;
    }

    // Insert
    if (e.keyCode === 45 && e.shiftKey) {
      let newChords = [...this.props.chords];
      newChords.splice(this.props.focusedNote.chordIndex + 1, 0, this.getAllNulls(6));

      this.props.onEdit(newChords, this.props.focusedNote, e);
    }
    // Delete / Backspace
    else if (e.keyCode === 46 || e.keyCode === 8) {
      if (e.shiftKey) {
        this.clearCurrentlyFocusedChord(e);
      } else {
        this.clearCurrentlyFocusedNote(e);
      }
    }
    // Left
    else if (e.keyCode === 37) {
      this.goLeft(e);
    }
    // Right
    else if (e.keyCode === 39) {
      this.goRight(e);
    }
    // Up
    else if (e.keyCode === 38) {
      this.goUp(e);
    }
    // Down
    else if (e.keyCode === 40) {
      this.goDown(e);
    } else {
      this.onNoteTyped(e);
    }
  }

  private clearCurrentlyFocusedChord = (e: KeyboardEvent): void => {
    if (this.props.chords.length === 1) {
      return;
    }

    const newChords = [...this.props.chords];
    newChords.splice(this.props.focusedNote.chordIndex, 1);

    const newFocusedNote = { ...this.props.focusedNote };

    if (this.props.focusedNote.chordIndex === this.props.chords.length - 1) {
      newFocusedNote.chordIndex--;
    }

    this.props.onEdit(newChords, newFocusedNote, e);
  }

  private clearCurrentlyFocusedNote = (e: KeyboardEvent): void => {
    const newChords = [...this.props.chords];
    const newChord = [...newChords[this.props.focusedNote.chordIndex]];

    newChord[this.props.focusedNote.stringIndex] = null;
    newChords[this.props.focusedNote.chordIndex] = newChord;

    this.props.onEdit(newChords, this.props.focusedNote, e);
  }

  private goUp = (e: KeyboardEvent): void => {
    const newFocusedNote = { ...this.props.focusedNote };

    newFocusedNote.stringIndex = newFocusedNote.stringIndex === 0
      ? this.props.tuning.length - 1
      : newFocusedNote.stringIndex - 1;

    this.props.onKeyBoardNavigation(newFocusedNote, e);
  }

  private goRight = (e: KeyboardEvent): void => {
    const newFocusedNote = { ...this.props.focusedNote };

    newFocusedNote.chordIndex = newFocusedNote.chordIndex === this.props.chords.length - 1
      ? 0
      : newFocusedNote.chordIndex + 1;

    this.props.onKeyBoardNavigation(newFocusedNote, e);
  }

  private goDown = (e: KeyboardEvent): void => {
    const newFocusedNote = { ...this.props.focusedNote };

    newFocusedNote.stringIndex = newFocusedNote.stringIndex === this.props.tuning.length - 1
      ? 0
      : newFocusedNote.stringIndex + 1;

    this.props.onKeyBoardNavigation(newFocusedNote, e);
  }

  private goLeft = (e: KeyboardEvent): void => {
    const newFocusedNote = { ...this.props.focusedNote };

    newFocusedNote.chordIndex = newFocusedNote.chordIndex === 0
      ? this.props.chords.length - 1
      : newFocusedNote.chordIndex - 1;

    this.props.onKeyBoardNavigation(newFocusedNote, e);
  }

  private onNoteTyped = (e: KeyboardEvent): void => {
    const typedText = e.key;

    if (typedText.trim() === '') {
      this.clearCurrentlyFocusedNote(e);
      return;
    }

    const typedTextAsNumber: number = +typedText;

    if (!Number.isInteger(typedTextAsNumber)) {
      return;
    }

    const newChords = [...this.props.chords];
    const newChord = [...newChords[this.props.focusedNote.chordIndex]];
    const newFretNum = this.getNewFretNumber(newChord, typedText);

    if (newFretNum <= this.props.maxFretNum) {
      newChord[this.props.focusedNote.stringIndex] = newFretNum;
    } else {
      newChord[this.props.focusedNote.stringIndex] = typedTextAsNumber;
    }

    newChords[this.props.focusedNote.chordIndex] = newChord;

    this.props.onEdit(newChords, this.props.focusedNote, e);
  }

  private getNewFretNumber = (chord: (number | null)[], typedNumberAsString: string): number => {
    const currentFretAsNumber: (number | null) = chord[this.props.focusedNote.stringIndex];

    const currentFretAsString: string = currentFretAsNumber === null
      ? ''
      : currentFretAsNumber.toString();

    const newFret = currentFretAsString + typedNumberAsString;
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

interface ITablatureState {
  editorIsFocused: boolean;
}

export interface ITablatureProps {
  chords: (number | null)[][];
  tuning: INote[];
  maxFretNum: number;
  mapFromNoteLetterEnumToString: Map<NoteLetter, string>;
  focusedNote: ITabNoteLocation;
  onKeyBoardNavigation: (newFocusedNote: ITabNoteLocation, e: KeyboardEvent) => void;
  onEdit: (newChords: (number | null)[][], newFocusedNote: ITabNoteLocation, e: KeyboardEvent) => void;
  onNoteClick: (newFocusedNote: ITabNoteLocation, e: React.MouseEvent) => void;
  onNoteRightClick: (noteClicked: ITabNoteLocation, e: React.MouseEvent) => void;
}

export interface ITabNoteLocation {
  chordIndex: number;
  stringIndex: number;
}