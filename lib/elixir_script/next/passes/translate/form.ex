defmodule ElixirScript.Translate.Form do
  alias ESTree.Tools.Builder, as: J
  alias ElixirScript.Translate.Forms.{Bitstring, Match, Call, Try, For, Struct}
  alias ElixirScript.Translate.Functions.{Erlang, Lists, Maps}
  alias ElixirScript.Translator.Identifier
  alias ElixirScript.Translate.Clause

  @erlang_modules [
    :erlang,
    :maps,
    :lists,
    :gen,
    :elixir_errors,
    :supervisor,
    :application,
    :code,
    :elixir_utils,
    :file
  ]

  @moduledoc """
  Handles translation of all forms that are not functions or clauses
  """

  def compile(nil, _) do
    J.identifier("null")
  end

  def compile(form, _) when is_boolean(form) or is_integer(form) or is_float(form) or is_binary(form)  do
    J.literal(form)
  end

  def compile(form, state) when is_list(form) do
    J.array_expression(
      Enum.map(form, &compile(&1, state))
    )
  end

  def compile(form, state) when is_atom(form) do
    if ElixirScript.Translate.Module.is_elixir_module(form) do
      members = if form == Elixir, do: ["Elixir"], else: ["Elixir"] ++ Module.split(form)
      J.identifier(Enum.join(members, "_"))
    else
      J.call_expression(
        J.member_expression(
          J.identifier("Symbol"),
          J.identifier("for")
        ),
        [J.literal(form)]
      )
    end
  end

  def compile({a, b}, state) do
    compile({:{}, [], [a, b]}, state)
  end

  def compile({:{}, _, elements}, state) do
    J.call_expression(
      J.member_expression(
        J.member_expression(
          J.identifier("Bootstrap"),
          J.identifier("Core")
        ),
        J.identifier("Tuple")
      ),
      Enum.map(elements, &compile(&1, state))
    )
  end

  def compile({:%{}, _, _} = map, state) do
    ElixirScript.Translate.Forms.Map.compile(map, state)
  end

  def compile({:<<>>, _, _} = bitstring, state) do
    Bitstring.compile(bitstring, state)
  end

  def compile({:=, _, [_, _]} = match, state) do
    Match.compile(match, state)
  end

  def compile({:%, _, [_, _]} = ast, state) do
    Struct.compile(ast, state)
  end

  def compile({:for, _, _} = ast, state) do
    For.compile(ast, state)
  end

  def compile({:case, _, [condition, [do: clauses]]}, state) do
    func = J.call_expression(
      J.member_expression(
        ElixirScript.Translate.Function.patterns_ast(),
        J.identifier("defmatch")
      ),
      Enum.map(clauses, &Clause.compile(&1, state))
    )

    J.call_expression(
      J.member_expression( func, J.identifier("call")),
      [J.identifier(:this), compile(condition, state)]
    )
  end

  def compile({:cond, _, [[do: clauses]]}, state) do
    processed_clauses = Enum.map(clauses, fn({:->, _, [clause, clause_body]}) ->
      translated_body = Enum.map(List.wrap(clause_body), &compile(&1, state))
      |> Clause.return_last_statement
      translated_body = J.function_expression([], [], J.block_statement(translated_body))

      translated_clause = compile(hd(clause), state)


      J.array_expression([translated_clause, translated_body])
    end)


    cond_function = J.member_expression(
      J.member_expression(
        J.identifier("Bootstrap"),
        J.member_expression(
          J.identifier("Core"),
          J.identifier("SpecialForms")
        )
      ),
      J.identifier("cond")
    )

    J.call_expression(
      cond_function,
      processed_clauses
    )
  end

  def compile({:receive, context, _}, _state) do
    line = Keyword.get(context, :line, 1)
    raise ElixirScript.CompileError, message: "Line: #{line} receive not supported"
  end

  def compile({:try, _, [blocks]}, state) do
    Try.compile(blocks, state)
  end

  def compile({:fn, _, clauses}, state) do
    J.call_expression(
      J.member_expression(
        ElixirScript.Translate.Function.patterns_ast(),
        J.identifier("defmatch")
      ),
      Enum.map(clauses, &Clause.compile(&1, state))
    )
  end

  def compile({{:., _, [:erlang, function]}, _, [first]}, state) when function in [:+, :-] do
    J.unary_expression(
      function,
      compile(first, state),
      true
    )
  end

  def compile({{:., _, [:erlang, :not]}, _, [first]}, state) do
    J.unary_expression(
      :!,
      compile(first, state),
      true
    )
  end

  def compile({{:., _, [:erlang, :bnot]}, _, [first]}, state) do
    J.unary_expression(
      :"~",
      compile(first, state),
      true
    )
  end

  def compile({{:., _, [:erlang, :=]}, _, [_, _] = match}, state) do
    Match.compile(match, state)
  end

  def compile({{:., _, [:erlang, function]}, _, [first, second]}, state) when function in [:+, :-, :*, :/, :==, :>=] do
    J.binary_expression(
      function,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :"/="]}, _, [first, second]}, state) do
    J.binary_expression(
      :!=,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :"=<"]}, _, [first, second]}, state) do
    J.binary_expression(
      :<=,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :"=:="]}, _, [first, second]}, state) do
    J.binary_expression(
      :===,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :"=/="]}, _, [first, second]}, state) do
    J.binary_expression(
      :!==,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, function]}, _, [first, second]}, state) when function in [:andalso, :and] do
    J.binary_expression(
      :&&,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, function]}, _, [first, second]}, state) when function in [:orelse, :or] do
    J.binary_expression(
      :||,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :div]}, _, [first, second]}, state) do
    J.binary_expression(
      :/,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :rem]}, _, [first, second]}, state) do
    J.binary_expression(
      :mod,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :band]}, _, [first, second]}, state) do
    J.binary_expression(
      :&,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :bor]}, _, [first, second]}, state) do
    J.binary_expression(
      :|,
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :bsl]}, _, [first, second]}, state) do
    J.binary_expression(
      :"<<",
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :bsl]}, _, [first, second]}, state) do
    J.binary_expression(
      :">>",
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :bxor]}, _, [first, second]}, state) do
    J.binary_expression(
      :">>",
      compile(first, state),
      compile(second, state)
    )
  end

  def compile({{:., _, [:erlang, :++]}, _, [_, _] = params}, state) do
    J.call_expression(
      J.member_expression(
        J.member_expression(
          J.member_expression(
            J.identifier("Bootstrap"),
            J.identifier("Core")
          ),
          J.identifier(:erlang)
        ),
        J.identifier("list_concatenation2")
      ),
      Enum.map(params, &compile(&1, state))
    )
  end

  def compile({{:., _, [:erlang, :--]}, _, [_, _] = params}, state) do
    J.call_expression(
      J.member_expression(
        J.member_expression(
          J.member_expression(
            J.identifier("Bootstrap"),
            J.identifier("Core")
          ),
          J.identifier(:erlang)
        ),
        J.identifier("list_substraction2")
      ),
      Enum.map(params, &compile(&1, state))
    )
  end


  def compile({{:., _, [module, function]}, _, params}, state) when module in @erlang_modules do
    J.call_expression(
      J.member_expression(
        J.member_expression(
          J.member_expression(
            J.identifier("Bootstrap"),
            J.identifier("Core")
          ),
          J.identifier(module)
        ),
        ElixirScript.Translator.Identifier.make_function_name(function, length(params))
      ),
      Enum.map(params, &compile(&1, state))
    )
  end

  def compile({{:., _, [_, _]}, _, _} = ast, state) do
    Call.compile(ast, state)
  end

  def compile({:super, context, params}, state) do
    {function_name, _} = Map.get(state, :function)

    J.call_expression(
      ElixirScript.Translator.Identifier.make_function_name(function_name, length(params)),
      Enum.map(params, &compile(&1, state))
    )
  end

  def compile({function_name, _, params}, state) when is_list(params) do
    case function_name do
      a when is_atom(a) ->
        J.call_expression(
          ElixirScript.Translator.Identifier.make_function_name(function_name, length(params)),
          Enum.map(params, &compile(&1, state))
        )
      _ ->
        J.call_expression(
          compile(function_name, state),
          Enum.map(params, &compile(&1, state))
        )        
    end
  end

  def compile({var, _, _}, state) do
    ElixirScript.Translator.Identifier.make_identifier(var)
  end

end
