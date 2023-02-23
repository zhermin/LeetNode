import { Container, createStyles, Grid } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  gridTop: {
    backgroundColor: theme.colors.gray[4],
    minHeight: 150,
  },
  gridChart: {
    backgroundColor: theme.colors.dark[0],
    minHeight: 400,
  },
}));

const Dashboard = () => {
  const { classes } = useStyles();

  return (
    <Container size="xl">
      <Grid gutter="lg">
        <Grid.Col className={classes.gridTop} span={4}>
          1
        </Grid.Col>
        <Grid.Col className={classes.gridTop} span={4}>
          2
        </Grid.Col>
        <Grid.Col className={classes.gridTop} span={4}>
          3
        </Grid.Col>
      </Grid>
      <Grid grow gutter="lg">
        <Grid.Col className={classes.gridChart} span={4}>
          1
        </Grid.Col>
        <Grid.Col className={classes.gridChart} span={4}>
          2
        </Grid.Col>
        <Grid.Col className={classes.gridChart} span={4}>
          3
        </Grid.Col>
        <Grid.Col className={classes.gridChart} span={4}>
          4
        </Grid.Col>
        <Grid.Col className={classes.gridChart} span={4}>
          5
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Dashboard;
