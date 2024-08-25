import Vex from 'vexflow';

type Stave = InstanceType<typeof Vex.Flow.Stave>;
type Voice = InstanceType<typeof Vex.Flow.Voice>;
type StaveNote = InstanceType<typeof Vex.Flow.StaveNote>;

export class Measure {
    private VF = Vex.Flow;
    private stave: Stave | null = null;
    private context: Vex.RenderContext;
    private num_beats: number = 0;
    private beat_value: number = 0;
    private width: number = 0;
    private height: number = 0;
    private voice1: Voice | null = null;

    constructor(
        context: Vex.RenderContext,
        x: number,
        y: number,
        width: number,
        timeSignature: string = "none",
        clef: string = "none"
    ) {
        this.stave = new this.VF.Stave(x, y, width);
        this.width = width;
        this.height = this.stave.getHeight();
        this.context = context;
        console.log("Context in Measure: " + context);

        if (timeSignature !== "none") {
            this.setTimeSignature(timeSignature);
        }
        console.log("Numbeats: " + this.num_beats);

        if (clef !== "none") {
            this.setClef(clef);
        }

        const notes = [
            new this.VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
            new this.VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
            new this.VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
            new this.VF.StaveNote({ keys: ["b/4"], duration: "qr" })
        ];

        this.voice1 = new this.VF.Voice({ num_beats: this.num_beats, beat_value: this.beat_value }).addTickables(notes);

        notes.forEach(note => {
            console.log(note.getTicks());
        });

        this.stave.setContext(context).draw();
        this.renderVoices();
    }

    setTimeSignature = (timeSignature: string): void => {
        if (this.stave) {
            this.stave.setTimeSignature(timeSignature);
            const [numBeats, beatValue] = timeSignature.split("/").map(Number);
            this.num_beats = numBeats;
            this.beat_value = beatValue;
        }
    }

    setClef = (clef: string): void => {
        if (this.stave) {
            this.stave.setClef(clef);
        }
    }

    private matchesNote = (staveNote: StaveNote, duration: string, noteId: string): boolean => {
        return staveNote.getAttributes().id === noteId && duration === staveNote.getDuration();
    }

    private isRest = (duration: string): boolean => {
        return duration.endsWith('r');
    }
    addNote = (keys: string[], duration: string, noteId: string): void => {
        if (this.isRest(duration))  return;
        if (!this.voice1) return;
        const VF = Vex.Flow;
        const notes: InstanceType<typeof Vex.Flow.StaveNote>[] = [];

        this.voice1.getTickables().forEach(tickable => {
            let staveNote = tickable as StaveNote;
            if (this.matchesNote(staveNote, duration, noteId)) {
                if (staveNote.getNoteType() !== 'r') {
                    const newKeys = staveNote.getKeys();
                    keys.forEach(key => {
                        // We don't want repeat keys
                        if (!newKeys.includes(key)) newKeys.push(key);
                    });
                    notes.push(new VF.StaveNote({ keys: newKeys, duration }));
                }
                // If the staveNote is a rest, then we replace it 
                else {
                    notes.push(new VF.StaveNote({ keys, duration }));
                }
            } else {
                // We just add the note that existed here previously (not changing anything on this beat)
                notes.push(staveNote as StaveNote);
            }
            const svgNote = document.getElementById('vf-' + staveNote.getAttributes().id);
            if (svgNote) svgNote.remove();
        });

        this.voice1 = new VF.Voice({ num_beats: this.num_beats, beat_value: this.beat_value }).addTickables(notes);
        this.renderVoices();
        // When adding a note you never want to override another note
        // However, if the StaveNote you are overriding is at REST, then override
    }

    modifyRest = (duration: string, noteId: string): void => {
        if (!duration.endsWith('r') || !this.voice1) return;

        const notes: StaveNote[] = [];

        this.voice1.getTickables().forEach(staveNote => {
            if (staveNote.getAttributes().id !== noteId) {
                notes.push(staveNote as StaveNote);
            }
            const svgNote = document.getElementById('vf-' + staveNote.getAttributes().id);
            if (svgNote) svgNote.remove();
        });

        // Implement your logic to replace the rest with new rests or notes based on the new duration

        // Ensure to check that the total ticks match
    }

    getCurrentBeats = (): number => {
        return this.num_beats;
    }

    renderVoices = (): void => {
        if (this.voice1 && this.stave) {
            new this.VF.Formatter().format([this.voice1], this.width - 25);
            this.voice1.draw(this.context, this.stave);
        }
    }
}
