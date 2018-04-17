function Node({ user_id, username, chat_id, gender, gender_pref, questions_picked }) {
    this.user_id = user_id;
    this.username = username;
    this.chat_id = chat_id;
    this.gender = gender;
    this.gender_pref = gender_pref;
    this.questions_picked = questions_picked;
    this.new_room = null;
    // this.partner = null;
    this.previous = null;
    this.next = null;
}

const DoublyLinkedList = function () {
    this.head = new Node({ username: "dummy head" });
    this.tail = new Node({ username: "dummy tail" });
    this.head.next = this.tail;
    this.head.prev = null;
    this.tail.prev = this.head;
    this.tail.next = null;
    this.count = 0;
}

// adds a new node to the tail
DoublyLinkedList.prototype.enqueue = function (data) {
    const node = new Node(data);
    node.prev = this.tail.prev;
    this.tail.prev.next = node;
    this.tail.prev = node;
    node.next = this.tail;
    this.count++;
    return node;
};

// pops a node from head
DoublyLinkedList.prototype.dequeue = function () {
    if (0 == this.count) {
        console.log("Err: empty queue");
        return;
    }

    const node = this.head.next;
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.count--;
    return node;
}

// get a node in specific index
DoublyLinkedList.prototype.getNode = function (index) {
    let itr = this.head.next;
    while (itr != this.tail) {
        if (0 == index) {
            return itr;
        }
        itr = itr.next
        index--;
    }
}

// delete a node given a node object
DoublyLinkedList.prototype.remove = function (node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.count--;
}

// print out node based on node username
DoublyLinkedList.prototype.print = function () {
    let string = '';
    let current = this.head;
    while (current) {
        string += `[${current.username}]->`;
        current = current.next;
    }
    console.log(string.trim());
};

module.exports = DoublyLinkedList;