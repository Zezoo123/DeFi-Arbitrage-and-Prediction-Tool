/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface MockUniswapRouterInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "DAI"
      | "WETH"
      | "exchangeRate"
      | "feeRate"
      | "getAmountAfterFee"
      | "setExchangeRate"
      | "setFee"
      | "swapExactTokensForTokens"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "DAI", values?: undefined): string;
  encodeFunctionData(functionFragment: "WETH", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "exchangeRate",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "feeRate", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getAmountAfterFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setExchangeRate",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "swapExactTokensForTokens",
    values: [
      BigNumberish,
      BigNumberish,
      AddressLike[],
      AddressLike,
      BigNumberish
    ]
  ): string;

  decodeFunctionResult(functionFragment: "DAI", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "WETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "exchangeRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "feeRate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAmountAfterFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setExchangeRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setFee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "swapExactTokensForTokens",
    data: BytesLike
  ): Result;
}

export interface MockUniswapRouter extends BaseContract {
  connect(runner?: ContractRunner | null): MockUniswapRouter;
  waitForDeployment(): Promise<this>;

  interface: MockUniswapRouterInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  DAI: TypedContractMethod<[], [string], "view">;

  WETH: TypedContractMethod<[], [string], "view">;

  exchangeRate: TypedContractMethod<[], [bigint], "view">;

  feeRate: TypedContractMethod<[], [bigint], "view">;

  getAmountAfterFee: TypedContractMethod<
    [amount: BigNumberish],
    [bigint],
    "nonpayable"
  >;

  setExchangeRate: TypedContractMethod<
    [initalExchagneRate: BigNumberish],
    [void],
    "nonpayable"
  >;

  setFee: TypedContractMethod<[newFeeRate: BigNumberish], [void], "nonpayable">;

  swapExactTokensForTokens: TypedContractMethod<
    [
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      path: AddressLike[],
      to: AddressLike,
      deadline: BigNumberish
    ],
    [bigint[]],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "DAI"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "WETH"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "exchangeRate"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "feeRate"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getAmountAfterFee"
  ): TypedContractMethod<[amount: BigNumberish], [bigint], "nonpayable">;
  getFunction(
    nameOrSignature: "setExchangeRate"
  ): TypedContractMethod<
    [initalExchagneRate: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setFee"
  ): TypedContractMethod<[newFeeRate: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "swapExactTokensForTokens"
  ): TypedContractMethod<
    [
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      path: AddressLike[],
      to: AddressLike,
      deadline: BigNumberish
    ],
    [bigint[]],
    "nonpayable"
  >;

  filters: {};
}
