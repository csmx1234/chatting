{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "./app/queue_cpp/addon.cpp",
        "./app/queue_cpp/AsyncUserQueue.cpp",
        "./app/queue_cpp/DoublyLinkedListQueue.cpp"
      ],
      "include_dirs": ["<!(node -e \"require('nan')\")"]
    }
  ]
}