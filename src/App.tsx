import React, { Component } from 'react';
import { Tablature, ITabNoteLocation, INote, NoteLetter } from './tablature/tablature';
import './App.css';

interface IAppProps { }

interface IAppState {
  isFocused: boolean;
  chords: (number | null)[][];
  focusedNote: ITabNoteLocation;
  tuning: INote[];
  maxFretNum: number;
  mapFromNoteLetterEnumToString: Map<NoteLetter, string>;
}

class App extends Component<IAppProps, IAppState> {
  private tabsKey = 'tabs';

  constructor(props: IAppProps) {
    super(props);

    this.state = {
      isFocused: false,
      chords: this.getEmptyChords(16, 6),
      focusedNote: {
        chordIndex: 0,
        stringIndex: 0
      },
      tuning: [
        { letter: NoteLetter.E, octave: 4 },
        { letter: NoteLetter.B, octave: 3 },
        { letter: NoteLetter.G, octave: 3 },
        { letter: NoteLetter.D, octave: 3 },
        { letter: NoteLetter.A, octave: 2 },
        { letter: NoteLetter.E, octave: 2 },
      ],
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
      )
    };
  }

  componentDidMount(): void {
    const savedChordsStr = window.localStorage.getItem(this.tabsKey);

    if (!savedChordsStr) {
      return;
    }

    const chords: (number | null)[][] = JSON.parse(savedChordsStr);

    this.onEdit(chords, this.state.focusedNote);
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

  onNoteRightClick = (noteClicked: ITabNoteLocation, e: React.MouseEvent): void => { }

  render() {
    return (
      <div className="app">
        <Tablature
          chords={this.state.chords}
          tuning={this.state.tuning}
          maxFretNum={this.state.maxFretNum}
          mapFromNoteLetterEnumToString={this.state.mapFromNoteLetterEnumToString}
          focusedNote={this.state.focusedNote}
          onKeyBoardNavigation={this.onKeyBoardNavigation}
          onEdit={this.onEdit}
          onNoteClick={this.onNoteClick}
          onNoteRightClick={this.onNoteRightClick}
        ></Tablature>
      </div>
    );
  }

  private getEmptyChords(numChords: number, numFrets: number): null[][] {
    return new Array(numChords).fill(this.getAllNulls(numFrets));
  }

  private getAllNulls = (numFrets: number): null[] => {
    return new Array(numFrets).fill(null);
  }
}

export default App;
