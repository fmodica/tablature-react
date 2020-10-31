import { exception } from 'console';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Chord } from './chord';
import './tablature.css';

export class Tablature extends PureComponent<ITablatureProps, ITablatureState> {
  private editorRef: React.RefObject<HTMLDivElement>;

  constructor(props: ITablatureProps) {
    super(props);
    this.editorRef = React.createRef();
  }

  render(): JSX.Element {
    const tuningDisplay = this.getTuningElement();
    const chordsDisplay = this.getChordElements();

    // To get around TS errors
    const tabIndexAttr = { tabIndex: 0 };

    this.setEditorFocusIfNeeded();

    return (
      <div className='tablature-container'>
        <div className='tablature' {...tabIndexAttr} onFocus={this.onFocus} onBlur={this.onBlur} ref={this.editorRef}>
          {tuningDisplay}
          {chordsDisplay}
        </div>
      </div>
    );
  }

  componentDidMount(): void {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount(): void {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onNoteClick = (chordIndex: number, stringIndex: number, e: React.MouseEvent): void => {
    const newFocusedNote: ITabNoteLocation = { chordIndex, stringIndex };
    this.props.onNoteClick(newFocusedNote, e);
  };

  private getTuningElement(): JSX.Element {
    const tuningNotesDisplay = this.getTuningNoteElements();

    return (
      <div className='chord tuning'>
        {tuningNotesDisplay}
      </div>
    );
  }

  private getTuningNoteElements(): JSX.Element[] {
    return this.props.tuning.map((tuningNote, index) => {
      const noteLetterDisplay = this.props.mapFromNoteLetterEnumToString.get(tuningNote.letter);
      const key = `${index}|${tuningNote.letter}|${tuningNote.octave}`;

      return <div className='fret' key={key}>{noteLetterDisplay}</div>;
    });
  }

  private getChordElements(): JSX.Element[] {
    return this.props.chords.map((chord, chordIndex) => {
      if (chord.length !== this.props.tuning.length) {
        throw new Error(`The chord at index ${chordIndex} has ${chord.length} notes, but the tuning array has ${this.props.tuning.length} notes: [${chord}]`);
      }

      const focusedStringIndex: number | null = (this.editorAndNoteAreFocused() && chordIndex === this.props.focusedNote!.chordIndex)
        ? this.props.focusedNote!.stringIndex
        : null;

      // The entries of the chord array will be joined with commas
      const key: string = `${chordIndex}-${chord}`;

      return (
        <Chord
          key={key}
          chordIndex={chordIndex}
          focusedStringIndex={focusedStringIndex}
          notes={chord}
          notesPerMeasure={this.props.notesPerMeasure}
          onNoteClick={this.onNoteClick} />
      );
    });
  }

  private onFocus = (e: React.FocusEvent): void => {
    // Hack: The focus event fires and renders before the click event renders the newly focused note. So
    // there is a moment where the initial focused note is shown.
    setTimeout(() => {
      this.props.onEditorFocus(true, e);
    }, 100);
  };

  private onBlur = (e: React.FocusEvent): void => {
    // To be consistent with the onFocus method
    setTimeout(() => {
      this.props.onEditorFocus(false, e);
    });
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.editorAndNoteAreFocused()) {
      return;
    }

    // Insert
    if (e.keyCode === 45) {
      this.insertChord(e);
    }
    // Delete / Backspace
    else if (e.keyCode === 46 || e.keyCode === 8) {
      this.clearChord(e);
    }
    else if (e.keyCode === 37) {
      this.goLeft(e);
    }
    else if (e.keyCode === 39) {
      this.goRight(e);
    }
    else if (e.keyCode === 38) {
      this.goUp(e);
    }
    else if (e.keyCode === 40) {
      this.goDown(e);
    } else {
      this.onNoteTyped(e);
    }
  };

  private insertChord(e: KeyboardEvent): void {
    let newChords = [...this.props.chords];
    newChords.splice(this.props.focusedNote!.chordIndex, 0, this.getAllNulls(this.props.tuning.length));

    this.props.onEdit(newChords, this.props.focusedNote!, e);
  }

  private clearChord(e: KeyboardEvent): void {
    if (this.props.chords.length === 1) {
      return;
    }

    const newChords = [...this.props.chords];
    newChords.splice(this.props.focusedNote!.chordIndex, 1);

    const newFocusedNote: ITabNoteLocation = { ...this.props.focusedNote! };

    if (this.props.focusedNote!.chordIndex === this.props.chords.length - 1) {
      newFocusedNote.chordIndex--;
    }

    this.props.onEdit(newChords, newFocusedNote, e);
  }

  private clearNote(e: KeyboardEvent): void {
    const newChords = [...this.props.chords];
    const newChord = [...newChords[this.props.focusedNote!.chordIndex]];

    newChord[this.props.focusedNote!.stringIndex] = null;
    newChords[this.props.focusedNote!.chordIndex] = newChord;

    this.props.onEdit(newChords, this.props.focusedNote!, e);
  }

  private goUp(e: KeyboardEvent): void {
    const newFocusedNote: ITabNoteLocation = { ...this.props.focusedNote! };

    newFocusedNote.stringIndex = newFocusedNote.stringIndex === 0
      ? this.props.tuning.length - 1
      : newFocusedNote.stringIndex - 1;

    this.props.onKeyBoardNavigation(newFocusedNote, e);
  }

  private goRight(e: KeyboardEvent): void {
    const newFocusedNote: ITabNoteLocation = { ...this.props.focusedNote! };

    newFocusedNote.chordIndex = newFocusedNote.chordIndex === this.props.chords.length - 1
      ? 0
      : newFocusedNote.chordIndex + 1;

    this.props.onKeyBoardNavigation(newFocusedNote, e);
  }

  private goDown(e: KeyboardEvent): void {
    const newFocusedNote: ITabNoteLocation = { ...this.props.focusedNote! };

    newFocusedNote.stringIndex = newFocusedNote.stringIndex === this.props.tuning.length - 1
      ? 0
      : newFocusedNote.stringIndex + 1;

    this.props.onKeyBoardNavigation(newFocusedNote, e);
  }

  private goLeft(e: KeyboardEvent): void {
    const newFocusedNote: ITabNoteLocation = { ...this.props.focusedNote! };

    newFocusedNote.chordIndex = newFocusedNote.chordIndex === 0
      ? this.props.chords.length - 1
      : newFocusedNote.chordIndex - 1;

    this.props.onKeyBoardNavigation(newFocusedNote, e);
  }

  private onNoteTyped(e: KeyboardEvent): void {
    const typedText = e.key;

    if (typedText.trim() === '') {
      this.clearNote(e);
      return;
    }

    const typedTextAsNumber: number = +typedText;

    if (!Number.isInteger(typedTextAsNumber)) {
      return;
    }

    const newChords = [...this.props.chords];
    const newChord = [...newChords[this.props.focusedNote!.chordIndex]];

    const currentFret: (number | null) = newChord[this.props.focusedNote!.stringIndex];
    const newFretNum = this.getNewFretNumber(currentFret, typedTextAsNumber);

    if (newFretNum <= this.props.maxFretNum) {
      newChord[this.props.focusedNote!.stringIndex] = newFretNum;
    } else {
      newChord[this.props.focusedNote!.stringIndex] = typedTextAsNumber;
    }

    newChords[this.props.focusedNote!.chordIndex] = newChord;

    this.props.onEdit(newChords, this.props.focusedNote!, e);
  }

  private getNewFretNumber(currentFretAsNumber: number | null, typedTextAsNumber: number): number {
    const currentFretAsString: string = currentFretAsNumber === null
      ? ''
      : currentFretAsNumber.toString();

    const newFret = currentFretAsString + typedTextAsNumber.toString();
    const newFretAsNumber = parseInt(newFret);

    return newFretAsNumber;
  }

  private setEditorFocusIfNeeded() {
    setTimeout(() => {
      if (this.props.editorIsFocused) {
        if (document.activeElement !== ReactDOM.findDOMNode(this.editorRef.current)) {
          this.editorRef.current?.focus();
        }
      }
      else {
        if (document.activeElement === ReactDOM.findDOMNode(this.editorRef.current)) {
          this.editorRef.current?.blur();
        }
      }
    }, 100);
  }

  private editorAndNoteAreFocused(): boolean {
    return this.props.editorIsFocused && !!this.props.focusedNote;
  }

  private getAllNulls(numFrets: number): null[] {
    return new Array(numFrets).fill(null);
  }
};

export enum NoteLetter {
  C,
  Dflat,
  D,
  Eflat,
  E,
  F,
  Gflat,
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
  editorIsFocused: boolean;
  chords: (number | null)[][];
  tuning: INote[];
  focusedNote: ITabNoteLocation | null;
  maxFretNum: number;
  mapFromNoteLetterEnumToString: Map<NoteLetter, string>;
  notesPerMeasure: number | null;
  onKeyBoardNavigation: (newFocusedNote: ITabNoteLocation, e: KeyboardEvent) => void;
  onEdit: (newChords: (number | null)[][], newFocusedNote: ITabNoteLocation, e: KeyboardEvent) => void;
  onNoteClick: (newFocusedNote: ITabNoteLocation, e: React.MouseEvent) => void;
  onEditorFocus: (isFocused: boolean, e: React.FocusEvent) => void;
}

export interface ITabNoteLocation {
  chordIndex: number;
  stringIndex: number;
}