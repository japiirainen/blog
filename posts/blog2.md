---
title: Implementing parser combinators pt. 2
publish_date: 2022-02-08
---

Welcome to part 2 of the series where we implement a simple _parser combinator_
library from scratch in haskell. In the first episode we defined our _Parser_
type and implemented all the necessary type-classes for it. You can find the
source [here](https://github.com/japiirainen/microparser). In addition to this
we defined a couple of _combinators_, which allowed us to defined the following
parser.

```haskell
pKv :: Parser KV
pKv = KV <$> parseKv
  where
    parseKv = (,) <$> many alpha <* char ':' <* spaces <*> many alpha
```

This simple parser parses key-value pairs into an haskell data type. We are also
able to _run_ our parser.

```haskell
runParser pKv "key: value" -- Right (KV ("key","value"))
```

This is already quite useful, but lets implement more _combinators_ to make our
little library feel a bit more polished. It would be nice if we could easily
extend our previously defined _pKv_ parser to parse lists of key value pairs.
This will be trivial if we define a combinator called _sepBy_.

```haskell
sepBy1 :: Parser a -> Parser b -> Parser [a]
sepBy1 p sep = (:) <$> p <*> many (sep *> p)

sepBy :: Parser a -> Parser b -> Parser [a]
sepBy parser separator = sepBy1 parser separator <|> pure []
```

Note that we defined _sepBy_ by using a stricter version of itself. _sepBy1_
will fail if there is only one _kv_ to parse, while _sepBy_ parses it happily.

Now defining a parser that parses a list of _kv's_ is trivial.

```haskell
pKvs :: Parser [KV]
pKvs = pKv `sepBy` char ','

runParser pKvs "key: value,foo: bar" -- Right [KV ("key","value"),KV ("foo","bar")]
```

Nice. Now that I think of it, wouldn't it be nice to be able to parse numbers? I
think so!

```haskell
import Data.Maybe (fromMaybe)
import Data.Applicative (Alternative(..), optional) 
import Data.Functor (($>))

digit :: Parser Char
digit = satisfy "digit" Char.isDigit

decimal :: (Integral a, Read a) => Parser a
decimal = read <$> many1 digit

signedDecimal :: Parser Int
signedDecimal = fromMaybe id <$> optional (char '-' $> negate) <*> decimal
```

Now we can parse numbers, Hooray! Here's a couple of examples.

```haskell
runParser (decimal @Int) "123" -- Right (123)
runParser (decimal @Int) "-123" -- Left "Expecting digit at position 0"
runParser signedDecimal "-123" -- Right (-123)
```

Parsing whitespace is also a common task, especially when you are writing a
_lexer_. Let's define some useful combinators to make _lexing_ more convenient.

```haskell
spaces :: Parser ()
spaces = void $ many (satisfy "whitespace" Char.isSpace)

newline :: Parser ()
newline = char '\n' <|> (char '\r' *> char '\n')

horizontalSpaces :: Parser ()
horizontalSpaces = void . many $
  satisfy "horizontal whitespace" $ \c ->
    Char.isSpace c && c /= '\n' && c /= '\r'
```

When we previously parsed key value pairs, they were separated by commas. You
might also want to parse key value pairs separated by newlines.

```txt
key: value
foo: bar
```

Let's write a parser for this.

```haskell
pKvsNewLine :: Parser [KV]
pKvsNewLine = pKv `sepBy` newline

runParser pKvsNewLine "key: value\nfoo: bar" -- Right [KV ("key","value"),KV ("foo","bar")]
```

Or we could want to parse _kv's_ which are separated by commas but have some
random spaces in between them. Eg. "key: value , foo: bar". We can use
_horizontalSpaces_ for this!

```haskell
pKvsHorizontal :: Parser [KV]
pKvsHorizontal = pKv `sepBy` s
  where s = horizontalSpaces *> char ',' <* horizontalSpaces
  
runParser pKvsHorizontal "key: value       ,        foo: bar" -- Right [KV ("key","value"),KV ("foo","bar")]
```

At this point we have quite a powerful set of tools in our hands. We still
haven't seen any interesting use-cases for this machinery. In the next part we
will define a parser for a simple programming language.

Thank you for reading, hope you enjoyed. Have a nice day!

- Joona

[Part 1](https://japiirainen.com/posts/parser-combinators-1.html)
