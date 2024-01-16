import { useMachine } from '@xstate/react';
import { Table, Button, Progress, Alert } from 'antd';
import { shell } from 'electron';
import {
  DownloadOutlined,
  ClearOutlined,
  GithubOutlined,
  EyeOutlined,
  FormatPainterOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import fsm from './fsm';

import './App.less';
function App() {
  const [state, send] = useMachine(fsm);
  const { captureList, currentUrl, downloadProgress } = state.context;

  return (
    <div className="App">
      {state.matches('检测初始化') ? <div>Checking...</div> : null}
      {state.matches('初始化完成') ? (
        <div className="App-inited">
          <Button
            className="App-inited-clear"
            icon={<ClearOutlined />}
            onClick={() => send('e_清空捕获记录')}
          >
            Clear
          </Button>
          <Button
            className="App-inited-github"
            icon={<GithubOutlined />}
            onClick={() => shell.openExternal('https://github.com/lecepin/WeChatVideoDownloader')}
            type="primary"
            ghost
          >
            Star Original
          </Button>
          <Button
            className="App-inited-github"
            icon={<GithubOutlined />}
            onClick={() => shell.openExternal('https://github.com/DenKey/WeChatVideoDownloaderInternationalVersion')}
            type="primary"
            ghost
          >
            Star Translation
          </Button>
          <Table
            sticky
            dataSource={captureList}
            columns={[
              {
                title: 'Video Title',
                dataIndex: 'description',
                key: 'description',
                render: value => value,
                ellipsis: true,
              },
              {
                title: 'Size',
                dataIndex: 'prettySize',
                key: 'prettySize',
                width: '100px',
                render: value => value,
              },
              {
                title: 'Action',
                dataIndex: 'action',
                key: 'action',
                width: '210px',
                render: (_, { url, decodeKey, hdUrl, fixUrl, description, fullFileName }) => (
                  <div>
                    {fullFileName ? (
                      <Button
                        icon={<EyeOutlined />}
                        type="primary"
                        onClick={() => {
                          shell.openPath(fullFileName);
                        }}
                        size="small"
                        ghost
                      >
                        Check
                      </Button>
                    ) : (
                      <Button
                        icon={<DownloadOutlined />}
                        type="primary"
                        onClick={() => {
                          send({
                            type: 'e_下载',
                            url: hdUrl || url,
                            decodeKey: decodeKey,
                            description: description,
                          });
                        }}
                        size="small"
                      >
                        Download
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            pagination={{ position: ['none', 'none'] }}
          ></Table>

          {state.matches('初始化完成.预览') ? (
            <div
              className="App-inited-preview"
              onClick={e => {
                e.target == e.currentTarget && send('e_关闭');
              }}
            >
              <video src={currentUrl} controls autoPlay></video>
            </div>
          ) : null}

          {state.matches('初始化完成.下载.下载中') ? (
            <div className="App-inited-download">
              <Progress type="circle" percent={downloadProgress} />
            </div>
          ) : null}
        </div>
      ) : null}
      {state.matches('未初始化') ? (
        <div className="App-uninit">
          <Alert message="First time entering, please initialize first" type="warning" showIcon closable={false} />
          <Button
            size="large"
            onClick={() => send('e_开始初始化')}
            type="primary"
            icon={<FormatPainterOutlined />}
          >
            Initialization
          </Button>
          &nbsp;&nbsp;
          <Button size="large" onClick={() => send('e_重新检测')} icon={<RedoOutlined />}>
            Recheck
          </Button>
        </div>
      ) : null}
      {state.matches('开启服务失败') ? (
        <div className="App-uninit">
          <Alert message="Failed to start the service, please check your certificate" type="error" showIcon closable={false} />
          <Button size="large" onClick={() => send('e_重试')} type="primary">
            Try to enable
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default App;
