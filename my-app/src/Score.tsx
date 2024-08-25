import Vex from 'vexflow';
import { Measure } from './Measure';

export class Score {
    private VF = Vex.Flow;
    private measures: Measure[] = [];

    constructor(
        notationRef: HTMLDivElement, 
        x: number, 
        y: number, 
        measureWidth: number, 
        timeSignature: string = "4/4"
    ) {
        const renderer = new this.VF.Renderer(notationRef, this.VF.Renderer.Backends.SVG);
        renderer.resize(800, 400);
        const context = renderer.getContext();
        const firstMeasure = new Measure(context, x, y, measureWidth, timeSignature, "treble");
        this.measures.push(firstMeasure);
    }

    addNoteInMeasure = (
        measureIndex: number, 
        keys: string[], 
        duration: string, 
        noteId: string
    ): void => {
        this.measures[measureIndex].addNote(keys, duration, noteId);
    }

    modifyDurationInMeasure = (
        measureIndex: number, 
        duration: string, 
        noteId: string
    ): void => {
        this.measures[measureIndex].modifyDuration(duration, noteId);
    }
}
