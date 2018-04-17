#include <nan.h>
#include <iostream>
#include "AsyncUserQueue.h"
#include "DoublyLinkedListQueue.h"

using Nan::AsyncQueueWorker;
using Nan::AsyncWorker;
using Nan::Callback;
using Nan::HandleScope;
using Nan::New;
using Nan::Null;
using Nan::To;
using v8::String;
using v8::Function;
using v8::Local;
using v8::Number;
using v8::Value;

class AsyncUserQueue : public AsyncWorker
{
  public:
    AsyncUserQueue(Callback *callback, string to_print)
        : AsyncWorker(callback) {
            printt(to_print);
        }
    ~AsyncUserQueue() {}

    void Execute()
    {
    }

    void HandleOKCallback()
    {
        // HandleScope scope;

        // Local<Value> argv[] = {
            // Null()
        // };

        // callback->Call(2, argv, async_resource);
    }
};

NAN_METHOD(pairUpUsers)
{
    v8::String::Utf8Value to_print_v8(Nan::To<v8::String>(info[0]).ToLocalChecked());
    string to_print = string(*to_print_v8);
    // Callback *callback = new Callback(To<Function>(info[1]).ToLocalChecked());
    AsyncQueueWorker(new AsyncUserQueue(NULL, to_print));
}