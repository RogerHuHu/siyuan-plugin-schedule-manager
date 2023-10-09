
export class Schedule {
    id: string;
    title: string;
    start: string;
    end: string;
    category: string;
    content: string;
    status: number;

    constructor(id?: string, title?: string, start?: string, end?: string, 
                category?: string, content?: string, status?: number) {
        this.id = id;
        this.title = title;
        this.start = start;
        this.end = end;
        this.category = category;
        this.content = content;
        this.status = status;
    }
}