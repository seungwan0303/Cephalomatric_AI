import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from model import Model


class Target:
    def __init__(self):
        self.observer = Observer()
        self.watchDir = '../BackEnd/cloud'
        # self.watchDir = './test'

    def run(self):
        event_handler = Handler()
        self.observer.schedule(event_handler, self.watchDir, recursive=True)
        print('Start')
        self.observer.start()
        try:
            while True:
                time.sleep(0.2)
        except KeyboardInterrupt:
            self.observer.stop()
            print("KeyboardInterrupt")
            self.observer.join()
        except:
            self.observer.stop()
            print('Error')
            self.observer.join()


class Handler(FileSystemEventHandler, Model):
    def __init__(self):
        super().__init__()
        pass

    def on_moved(self, event):
        pass

    def on_created(self, event):
        print(event)
        format_index = event.src_path.rfind('.')
        if event.src_path[format_index + 1:] == 'png':
            super().predict(event.src_path)
            super().write_json(event.src_path[:format_index + 1])

    def on_deleted(self, event):
        pass

    def on_modified(self, event):
        pass


if __name__ == '__main__':
    w = Target()
    w.run()
