import {
  Button,
  Grid,
  makeStyles,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Card
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useMetaMask } from 'metamask-react';
import { getBalance, getPrntrBalance, getAllowance, approveAmount, deposit, claim, web3, getDecimals } from '../shared/helper/contract';
import CircularProgress from '@material-ui/core/CircularProgress';
import Web3 from 'web3';

export const Home = () => {
  const styles = useStyles();

  const maxAmount = 10;

  const { connect, status, account } = useMetaMask();
  const connected = status === 'connected';
  const [user, setUser] = useState({
    address: null,
    balance: 0,
    allowance: 0,
    prntrBalance: 0
  });

  const [decimals, setDecimals] = useState(0);

  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (account) {
      web3.eth.setProvider(Web3.givenProvider);
      getBalance(account).then(async (balance) => {
        const allowance = await getAllowance(account);
        const decimals = await getDecimals();
        const prntrBalance = await getPrntrBalance(account);
        setDecimals(+decimals);

        setUser({
          address: account.toLowerCase(),
          allowance: allowance,
          balance: +balance / 10 ** +decimals,
          prntrBalance: +prntrBalance / 10 ** +decimals, // decimals is 18. same as pax-lp
        })
      }).catch(error => {
        console.log(error);
      });
    }
  }, [account]);

  const connectAccount = () => {
    if (connected) {
      return;
    }
    connect();
  };

  const handleApproveAmount = () => {
    setLoading(true);
    approveAmount(account, web3.utils.toBN(maxAmount).mul(web3.utils.toBN(10 ** +decimals))).then((res) => {
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
    });
  }

  const handleDeposit = () => {
    setLoading(true);
    const amount = Math.min(maxAmount, +user.balance);
    const v = getDecimalAndInt(amount);
    const value = web3.utils.toBN(v.integer).mul(web3.utils.toBN(10 ** +(decimals - v.decimals)));
    deposit(account, value).then(async (res) => {
      const balance = await getBalance(account);
      setUser({...user, balance: +balance / 10 ** +decimals});
      console.log(user);
      setLoading(false);
    }).catch((err) => {
      console.log(err);
      setLoading(false);
    });
  };
  const handleClaim = () => {
    setLoading(true);
    claim(account).then(async (res) => {
      const prntrBalance = await getPrntrBalance(account);
      setUser({...user, prntrBalance: +prntrBalance / 10 ** +decimals});
      setLoading(false);
    }).catch((err) => {
      console.log(err);
      setLoading(false);
    });
  };
  const getDecimalAndInt = (balance) => {
    balance = `${balance}`;
    if (!balance.includes('.')) {
      return {
        decimals: 0,
        integer: balance
      };
    }
    return {
      decimals: balance.length - balance.indexOf('.') - 1,
      integer: balance.replace('.', '')
    }
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      direction="row"
      className={styles.cardMainRoot}>
      <Grid item xs={11} md={6} sm={9}>
        <Card className={styles.cardRoot}>
          <CardHeader
            title="Stake LP tokens to earn."
            classes={{ title: styles.cardMainTitle }}
          />
          <CardContent className={styles.cardMainBody}>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={3}>
              <Grid item className={styles.lineItem} md={7} sm={7}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    PAX-LP Balance:
                  </Typography>
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    {Number(user.balance).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item className={styles.lineItem} md={7} sm={7}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    Max Deposit Amount:
                  </Typography>
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    {maxAmount}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item className={styles.lineItem} md={7} sm={7}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    PRNTR Balance:
                  </Typography>
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    {Number(user.prntrBalance).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={3}>
              <Grid item xs={6}>
                <Button variant="contained" className={styles.button} onClick={connectAccount} disabled={connected}>
                  Connect
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" className={styles.button} onClick={handleApproveAmount} disabled={loading || !connected || user.allowance > 0}>
                  { loading ? <CircularProgress color="inherit" /> : 'Enable' }
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" className={styles.button} onClick={handleDeposit} disabled={loading || !connected || user.balance === 0} xs={12}>
                  { loading ? <CircularProgress color="inherit" /> : 'Stake' }
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" className={styles.button} onClick={handleClaim} disabled={loading || !connected} xs={12}>
                  { loading ? <CircularProgress color="inherit" /> : 'Claim' }
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  cardMainRoot: {
    margin: '50px 0px'
  },
  cardRoot: {
    color: 'black',
    padding: '80px 0px',
    boxShadow: '0 0 25px 0 rgb(0 0 0 / 10%)',
    transition: 'all 0.4s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',

    [theme.breakpoints.down("md")]: {
      padding: '60px 0px',
    },
    [theme.breakpoints.down("sm")]: {
      padding: '20px 0px',
    },

    "&:hover": {
      transform: 'translateY(-10px)'
    },
    "&::before": {
      content: '""',
      backgroundImage: 'linear-gradient(45deg, white, #d7e9fd)',
      backgroundSize: 'cover',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      position: 'absolute',
      opacity: 0.5,
      zIndex: -2,
    }
  },
  cardMainTitle: {
    color: '#2a2f31',
    fontWeight: 500,
    fontSize: '1.68rem',
    [theme.breakpoints.down("md")]: {
      fontSize: '1.3rem'
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '1rem'
    }
  },
  cardMainBody: {
    position: 'relative',
    width: '100%',
    marginTop: 30,
    [theme.breakpoints.down("sm")]: {
      marginTop: 10
    }
  },
  cardValue: {
    color: '#2a2f31',

    [theme.breakpoints.down("md")]: {
      fontSize: '1.2rem'
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '1rem'
    }
  },
  button: {
    color: '#ffffff',
    padding: 7,
    fontSize: '1.48rem',
    fontWeight: 400,
    background: '#64884d',
    marginTop: 20,
    width: '100%',
    boxShadow: '0px 0px 0px 0px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 5%), 0px 0px 0px 0px rgb(0 0 0 / 12%)',

    '&:hover': {
      boxShadow: '0px 0px 0px 0px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 12%), 0px 0px 0px 0px rgb(0 0 0 / 12%)'
    },
    '&:disabled': {
      background: '#64884d',
      color: '#6c757d'
    },
    [theme.breakpoints.down("md")]: {
      fontSize: '1.3rem'
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '1.3rem'
    },

    span: {
      color: '#2a2f31'
    }
  },
  lineItem: {
    width: '100%',
    padding: '3px !important'
  }
}));

export default Home;
