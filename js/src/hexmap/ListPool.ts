import {Stack} from './util/Stack';
export class ListPool<T> {
    stack: Stack<Array<T>> = new Stack<Array<T>>();

    get(): Array<T> {
        if (this.stack.size() > 0) {
            return this.stack.pop()!;
        }
        return new Array<T>();
    }

    add(list: Array<T>) {
        list.splice(0);
        this.stack.push(list);
    }
}
