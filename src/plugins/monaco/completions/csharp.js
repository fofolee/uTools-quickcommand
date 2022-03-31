var Keyword = "abstract as async await base break case catch checked class const continue" + " default delegate do else enum event explicit extern finally fixed for" + " foreach goto if implicit in interface internal is lock namespace new" + " operator out override params private protected public readonly ref return sealed" + " sizeof stackalloc static struct switch this throw try typeof unchecked" + " unsafe using virtual void volatile while add alias ascending descending dynamic from get" + " global group into join let orderby partial remove select set value var yield" + "catch class do else finally for foreach if struct switch try while" + "class interface namespace struct var"
var Struct = "Action Boolean Byte Char DateTime DateTimeOffset Decimal Double Func" + " Guid Int16 Int32 Int64 Object SByte Single String Task TimeSpan UInt16 UInt32" + " UInt64 bool byte char decimal double short int long object" + " sbyte float string ushort uint ulong"
var Text = "true false null"
Keyword = Keyword.split(" ")
Struct = Struct.split(" ")
Text = Text.split(" ")
export default {
    Keyword,
    Struct,
    Text
}
