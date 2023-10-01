
export class Schedule {
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    category: string;
    content: string;
    status: string;

    constructor(id?: string, title?: string, start?: string, end?: string, backgroundColor?: string, borderColor?: string, 
                category?: string, content?: string, status?: string) {
        this.id = id;
        this.title = title;
        this.start = start;
        this.end = end;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.category = category;
        this.content = content;
        this.status = status;
    }
}