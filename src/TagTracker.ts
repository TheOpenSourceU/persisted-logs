export default class TagTracker {
  private readonly tags: ({id:number, tag:string})[] = [];
  private readonly tagSet: Set<string> = new Set<string>();
  
  has(tag: string) {
    tag = tag.trim();
    if (!tag) return false;
    return this.tagSet.has(tag);
  }
  get(tag: string): number {
    if (!tag.trim()) return -1;
    if (!this.tagSet.has(tag)) return -1;
    return this.tags.find(t => t.tag === tag)?.id ?? -1;
    
  }
  add(tag: string, lastID: number) {
    // tag = tag.trim();
    // if (!tag) return;
    // if (this.tagSet.has(tag)) return;
    // this.tags.push({id: lastID, tag});
    // this.tagSet.add(tag);
  }
  
}