import axios from 'axios';
interface DetailsType {
  nodeUrl: string;
  accountAddress: string;
  timeout: number;
}

export async function getWalletDetails({ nodeUrl, accountAddress, timeout }: DetailsType) {
  try {
    const {
      data: {
        account: { balance, nonce },
      },
    } = await axios.get(`${nodeUrl}/address/${accountAddress}`, { timeout });

    return {
      balance,
      nonce,
      detailsFetched: true,
    };
  } catch (err) {
    console.error(err);
    return {
      balance: '',
      nonce: 0,
      detailsFetched: false,
    };
  }
}

interface GetLatestTransactionsType {
  elasticUrl: string;
  accountAddress: string;
  timeout: number;
  page?: number;
}

export async function getLatestTransactions({
  elasticUrl,
  accountAddress,
  timeout,
}: GetLatestTransactionsType) {
  try {
    const {
      data: {
        hits: { hits, total },
      },
    } = await axios.post(
      `${elasticUrl}/transactions/_search`,
      {
        query: {
          bool: {
            should: [
              { match: { sender: accountAddress } },
              { match: { receiver: accountAddress } },
            ],
          },
        },
        sort: {
          timestamp: {
            order: 'desc',
          },
        },
      },
      { timeout }
    );

    return {
      transactions: hits.map((transaction: any) => ({
        ...transaction._source,
        hash: transaction._id,
      })),
      transactionsFetched: true,
      totalTransactions: total.value || total,
    };
  } catch (err) {
    return {
      transactions: [],
      transactionsFetched: false,
      totalTransactions: 0,
    };
  }
}
