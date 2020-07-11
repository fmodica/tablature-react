import React, { Component } from 'react';
import { Tablature, ITabNoteLocation, INote, NoteLetter } from './tablature/tablature';
import './App.css';

interface IAppProps { }

interface IAppState {
  chords: (number | null)[][];
  focusedNote: ITabNoteLocation;
  tuning: INote[];
  mapFromNoteLetterEnumToString: Map<NoteLetter, string>;
}

class App extends Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);

    this.state = {
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
      mapFromNoteLetterEnumToString: new Map(
        [
          [NoteLetter.Aflat, 'Ab'],
          [NoteLetter.A, 'A'],
          [NoteLetter.Bflat, 'Bb'],
          [NoteLetter.B, 'B'],
          [NoteLetter.C, 'C'],
          [NoteLetter.Csharp, 'C#'],
          [NoteLetter.D, 'D'],
          [NoteLetter.Eflat, 'Eb'],
          [NoteLetter.E, 'E'],
          [NoteLetter.F, 'F'],
          [NoteLetter.Fsharp, 'F#'],
          [NoteLetter.G, 'G']
        ]
      )
    };
  }

  onFretClick = (clickedChordIndex: number, clickedStringIndex: number) => { }

  onFretRightClick = (clickedChordIndex: number, clickedStringIndex: number, x: number, y: number) => { }

  render() {
    return (
      <div className="App">
        <Tablature
          chords={this.state.chords}
          tuning={this.state.tuning}
          mapFromNoteLetterEnumToString={this.state.mapFromNoteLetterEnumToString}
          focusedNote={this.state.focusedNote}
          onFretClick={this.onFretClick}
          onFretRightClick={this.onFretRightClick}
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
