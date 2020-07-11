import React from 'react';
import './tablature.css';

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

export interface TablatureProps {
  chords: (number | null)[][];
  tuning: INote[];
  mapFromNoteLetterEnumToString: Map<NoteLetter, string>;
  focusedNote: ITabNoteLocation;
  onFretClick: (clickedChordIndex: number, clickedStringIndex: number) => void;
  onFretRightClick: (clickedChordIndex: number, clickedStringIndex: number, x: number, y: number) => void;
}

export interface ITabNoteLocation {
  chordIndex: number;
  stringIndex: number;
}

export const Tablature: React.FC<TablatureProps> = props => {
  const tuningDisplay = getTuningDisplay(props);
  const chordsDisplay = getChordsDisplay(props);

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
};

function getChordsDisplay(props: React.PropsWithChildren<TablatureProps>) {
  return props.chords.map((chord, index) => {
    return getChordDisplay(chord, index, props);
  });
}

function getTuningDisplay(props: React.PropsWithChildren<TablatureProps>) {
  return props.tuning.map((tuningNote, index) => {
    return <div className='fret' key={index}>{props.mapFromNoteLetterEnumToString.get(tuningNote.letter)}</div>;
  });
}

function getChordDisplay(chord: (number | null)[], chordIndex: number, props: React.PropsWithChildren<TablatureProps>) {
  const fretsDisplay = getFretsDisplay(chord, chordIndex, props);

  return (
    <div className='chord' key={chordIndex}>
      {fretsDisplay}
    </div>
  );
}

function getFretsDisplay(chord: (number | null)[], chordIndex: number, props: React.PropsWithChildren<TablatureProps>): React.ReactNode {
  return chord.map((fret, stringIndex) => {
    return getFretDisplay(chordIndex, stringIndex, fret, props);
  });
}

function getFretDisplay(chordIndex: number, stringIndex: number, fret: number | null, props: React.PropsWithChildren<TablatureProps>) {
  const isFocused = props.focusedNote.chordIndex === chordIndex && props.focusedNote.stringIndex === stringIndex;
  const className = 'fret' + (isFocused ? ' blink' : '');

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    props.onFretRightClick(chordIndex, stringIndex, e.clientX, e.clientY);
  };

  const onClick = () => props.onFretClick(chordIndex, stringIndex);

  const fretNumDisplay = fret === null
    ? <span>{isFocused ? '_' : '-'}</span> :
    fret;

  return (
    <div className={className} key={stringIndex} onClick={onClick} onContextMenu={onContextMenu}>
      {fretNumDisplay}
    </div>
  );
}