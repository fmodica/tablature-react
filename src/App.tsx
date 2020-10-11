import React, { Component } from 'react';
import { Tablature, ITabNoteLocation, INote, NoteLetter } from './tablature/tablature';
import './App.css';

export default class App extends Component<IAppProps, IAppState> {
  private tabsKey = 'tabs';

  constructor(props: IAppProps) {
    super(props);

    this.state = this.getInitialState();
  }

  render(): JSX.Element {
    return (
      <div className="app">
        <button className='reset-btn' onClick={this.onReset}>Reset</button>

        <Tablature
          editorIsFocused={this.state.editorIsFocused}
          chords={this.state.chords}
          tuning={this.state.tuning}
          focusedNote={this.state.focusedNote}
          maxFretNum={this.state.maxFretNum}
          mapFromNoteLetterEnumToString={this.state.mapFromNoteLetterEnumToString}
          notesPerMeasure={this.state.notesPerMeasure}
          onKeyBoardNavigation={this.onKeyBoardNavigation}
          onEdit={this.onEdit}
          onNoteClick={this.onNoteClick}
          onEditorFocus={this.onEditorFocus}
        ></Tablature>
      </div>
    );
  }

  componentDidMount(): void {
    const savedChordsStr = window.localStorage.getItem(this.tabsKey);

    if (!savedChordsStr) {
      return;
    }

    const chords: (number | null)[][] = JSON.parse(savedChordsStr);

    this.setState({ chords: chords });
  }

  onKeyBoardNavigation = (newFocusedNote: ITabNoteLocation, e: KeyboardEvent): void => {
    e.preventDefault();
    this.setState({ focusedNote: newFocusedNote })
  }

  onFocusedNoteChange = (newFocusedNote: ITabNoteLocation): void => {
    this.setState({ focusedNote: newFocusedNote });
  }

  onEdit = (newChords: (number | null)[][], newFocusedNote: ITabNoteLocation): void => {
    this.setState({ chords: newChords, focusedNote: newFocusedNote });
    window.localStorage.setItem(this.tabsKey, JSON.stringify(newChords));
  }

  onNoteClick = (newFocusedNote: ITabNoteLocation, e: React.MouseEvent): void => {
    this.setState({ focusedNote: newFocusedNote });
  }

  onEditorFocus = (isFocused: boolean, e: React.FocusEvent): void => {
    this.setState({ editorIsFocused: isFocused });
  }

  onReset = (): void => {
    window.localStorage.removeItem(this.tabsKey);
    this.setState(this.getInitialState());
  }

  private getInitialState(): IAppState {
    const tuning: INote[] = [
      { letter: NoteLetter.E, octave: 4 },
      { letter: NoteLetter.B, octave: 3 },
      { letter: NoteLetter.G, octave: 3 },
      { letter: NoteLetter.D, octave: 3 },
      { letter: NoteLetter.A, octave: 2 },
      { letter: NoteLetter.E, octave: 2 }
    ];

    return {
      editorIsFocused: true,
      chords: this.getEmptyChords(16, tuning.length),
      focusedNote: {
        chordIndex: 0,
        stringIndex: 0
      },
      tuning: tuning,
      maxFretNum: 24,
      mapFromNoteLetterEnumToString: new Map(
        [
          [NoteLetter.Aflat, 'Ab'],
          [NoteLetter.A, 'A'],
          [NoteLetter.Bflat, 'Bb'],
          [NoteLetter.B, 'B'],
          [NoteLetter.C, 'C'],
          [NoteLetter.Dflat, 'C#'],
          [NoteLetter.D, 'D'],
          [NoteLetter.Eflat, 'Eb'],
          [NoteLetter.E, 'E'],
          [NoteLetter.F, 'F'],
          [NoteLetter.Gflat, 'F#'],
          [NoteLetter.G, 'G']
        ]
      ),
      notesPerMeasure: 8
    };
  }

  private getEmptyChords(numChords: number, numFrets: number): null[][] {
    return new Array(numChords).fill(this.getAllNulls(numFrets));
  }

  private getAllNulls = (numFrets: number): null[] => {
    return new Array(numFrets).fill(null);
  }
}

interface IAppProps { }

interface IAppState {
  editorIsFocused: boolean;
  chords: (number | null)[][];
  tuning: INote[];
  focusedNote: ITabNoteLocation | null;
  maxFretNum: number;
  mapFromNoteLetterEnumToString: Map<NoteLetter, string>;
  notesPerMeasure: number | null;
}
