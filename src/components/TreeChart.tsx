'use client';
import { RecurseiveDependencies } from '@/DTO';
import ReactECharts from 'echarts-for-react';

type TreeChartProps = {
  library: string;
  dependencies: RecurseiveDependencies;
};

type ChartTree = {
  name: string;
  children: ChartTree[];
};

const convertDependenciesToTree = (data: RecurseiveDependencies): ChartTree => {
  const { name, version, dependencies, devDependencies } = data;

  const children = [...dependencies, ...devDependencies].map((dependency) =>
    convertDependenciesToTree(dependency)
  );

  return {
    name: `${name}@${version}`,
    children,
  };
};

const TreeChart = ({ dependencies }: TreeChartProps) => {
  const chartData = convertDependenciesToTree(dependencies);

  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
    },
    series: [
      {
        type: 'tree',
        data: [chartData],
        top: '1%',
        left: '7%',
        bottom: '1%',
        right: '20%',

        symbolSize: 7,

        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: '1rem',
        },

        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left',
            fontSize: '1rem',
          },
        },

        emphasis: {
          focus: 'descendant',
        },

        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },
    ],
  };

  return (
    <div>
      <ReactECharts option={option} notMerge={true} lazyUpdate={true} />
    </div>
  );
};

export default TreeChart;
