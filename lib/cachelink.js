Object.defineProperty(exports, "__esModule", { value: true });
/**
 * create cache node object.
 */
function CreateNode(key) {
    return {
        key: key
    };
}
exports.CreateNode = CreateNode;
/**
 *
 */
class CacheLink {
    constructor() {
        this.length = 0;
    }
    /**
     * unshift
     */
    unshift(node) {
        if (!this.length) {
            this.head = node;
            this.tail = node;
        }
        else {
            this.head.prev = node;
            node.next = this.head;
            this.head = node;
        }
        this.length++;
        return node;
    }
    /**
     * push
     */
    push(node) {
        this.length++;
        if (!this.tail) {
            this.head = this.tail = node;
        }
        else {
            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
        }
    }
    /**
     * pop
     */
    pop() {
        this.length--;
        let node = this.tail;
        if (node.prev) {
            node.prev.next = null;
            this.tail = node.prev;
        }
        else {
            this.head = this.tail;
        }
        return node;
    }
    /**
     * remove
     */
    remove(node) {
        let prevNode = node.prev;
        let nextNode = node.next;
        this.length--;
        if (prevNode && !nextNode) {
            // node in end
            this.tail = prevNode;
            prevNode = node.next;
        }
        else if (prevNode && nextNode) {
            // node in middle
            prevNode.next = nextNode;
            nextNode.prev = prevNode;
        }
        else if (!prevNode && nextNode) {
            // node in head
            this.head = nextNode;
            nextNode.prev = undefined;
        }
        else if (!prevNode && !nextNode) {
            // only one
            this.head = this.tail = undefined;
        }
    }
    /**
     * forward
     */
    forward(node) {
        let prevNode = node.prev;
        let nextNode = node.next;
        if (!prevNode)
            return;
        // prevNode is head
        if (!prevNode.prev) {
            // only two node
            if (!nextNode) {
                node.prev = undefined;
                node.next = prevNode;
                prevNode.prev = node;
                prevNode.next = undefined;
                this.tail = prevNode;
                this.head = node;
            }
            else {
                nextNode.prev = prevNode;
                prevNode.next = nextNode;
                prevNode.prev = node;
                node.next = prevNode;
                node.prev = undefined;
                this.head = node;
            }
        }
        else {
            let prepreNode = prevNode.prev;
            if (!nextNode) {
                prepreNode.next = node;
                node.next = prevNode;
                node.prev = prepreNode;
                prevNode.prev = node;
                prevNode.next = undefined;
                this.tail = prevNode;
            }
            else {
                prepreNode.next = node;
                node.next = prevNode;
                node.prev = prepreNode;
                prevNode.prev = node;
                prevNode.next = nextNode;
                nextNode.prev = prevNode;
            }
        }
    }
    /**
     * backward
     */
    backward(node) {
        let prevNode = node.prev;
        let nextNode = node.next;
        if (!nextNode)
            return;
        if (!nextNode.next) {
            if (!prevNode) {
                nextNode.next = node;
                nextNode.prev = undefined;
                node.prev = nextNode;
                node.next = undefined;
                this.head = nextNode;
                this.tail = node;
            }
            else {
                prevNode.next = nextNode;
                nextNode.next = node;
                nextNode.prev = prevNode;
                node.next = undefined;
                node.prev = nextNode;
                this.tail = node;
            }
        }
        else {
            let nexnexNode = nextNode.next;
            if (!prevNode) {
                nextNode.next = node;
                nextNode.prev = undefined;
                node.next = nexnexNode;
                node.prev = nextNode;
                nexnexNode.prev = node;
                this.head = nextNode;
            }
            else {
                prevNode.next = nextNode;
                nextNode.next = node;
                nextNode.prev = prevNode;
                node.next = nexnexNode;
                node.prev = nextNode;
                nexnexNode.prev = node;
            }
        }
    }
    /**
     * clear
     */
    clear() {
        this.length = 0;
        this.head = this.tail = undefined;
    }
    /**
     * moveHead
     */
    moveHead(node) {
        let prevNode = node.prev;
        let nextNode = node.next;
        if (prevNode && !nextNode) {
            // node in end
            this.tail = prevNode;
            prevNode.next = node.next;
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
            node.prev = undefined;
        }
        else if (prevNode && nextNode) {
            // node in middle
            prevNode.next = nextNode;
            nextNode.prev = prevNode;
            node.next = this.head;
            node.prev = null;
            this.head.prev = node;
            this.head = node;
        }
        else if (!prevNode && nextNode || !prevNode && !nextNode) {
            //node in head or ony one node
        }
    }
    /**
     * keys
     */
    keys() {
        let pointer = this.head;
        let arr = [];
        while (pointer) {
            arr.push(pointer.key);
            pointer = pointer.next;
        }
        return arr;
    }
}
exports.CacheLink = CacheLink;
