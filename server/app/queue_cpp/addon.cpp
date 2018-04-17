#include <nan.h>
#include "AsyncUserQueue.h"

using Nan::GetFunction;
using Nan::New;
using Nan::Set;
using v8::FunctionTemplate;
using v8::Handle;
using v8::Object;
using v8::String;

NAN_MODULE_INIT(InitAll)
{
    Set(target, New<String>("pairUpUsers").ToLocalChecked(),
        GetFunction(New<FunctionTemplate>(pairUpUsers)).ToLocalChecked());
}

NODE_MODULE(addon, InitAll)