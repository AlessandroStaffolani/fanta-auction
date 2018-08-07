import sys
from threading import Thread
from src.ClientSocketIO import ClientSocketIO
from src.ServerAuth import ServerAuth


def main(argv):
    host = 'localhost'
    port = 5000
    username = ''
    password = ''
    if len(argv) < 5:
        print("\n\nMissing params, should type (NOTE: use this order for arguments): \n\n")
        print("-u [username]:\tserver username")
        print("-p [passowrd]:\tserver password", end='\n\n')
        print("optionally you could type:", end='\n\n')
        print("--host [server_host]:\tdefault is localhost")
        print("--port [server_post]:\tdefault is 5000")
        exit(0)
    else:
        username = argv[2]
        password = argv[4]
        if len(argv) > 5 and len(argv) == 9:
            if argv[5] == '--host':
                host = argv[6]
            if argv[7] == '--port':
                port = argv[8]

    server_url = 'http://' + host + ':' + str(port)

    server_auth = ServerAuth(server_url, username, password)
    server_auth.login()

    print("Waiting to connect to: " + host + " port: " + str(port))
    client_socket = ClientSocketIO(host, port)
    client_socket.connect(server_auth.get_server_token())
    socket_thread = Thread(target=client_socket.wait)
    socket_thread.start()

    import pygame

    pygame.init()

    # Loop until the user clicks the close button.
    done = False

    # Initialize the joysticks
    pygame.joystick.init()

    # -------- Main Program Loop -----------
    while not done:
        import time
        time.sleep(10)
        if client_socket.get_button_enabled():
            client_socket.emit({'button': 0})
            
        joystick_count = pygame.joystick.get_count()
        if joystick_count > 0:
            joystick = pygame.joystick.Joystick(0)
            joystick.init()

        # EVENT PROCESSING STEP
        for event in pygame.event.get():  # User did something
            if event.type == pygame.QUIT:  # If user clicked close
                done = True  # Flag that we are done so we exit this loop

            # Possible joystick actions: JOYAXISMOTION JOYBALLMOTION JOYBUTTONDOWN JOYBUTTONUP JOYHATMOTION
            if event.type == pygame.JOYBUTTONDOWN:
                print("Button pressed = ", event.button)
                if client_socket.get_button_enabled():
                    client_socket.emit({'button': event.button})

    # Close the window and quit.
    # If you forget this line, the program will 'hang'
    # on exit if running from IDLE.
    pygame.quit()


if __name__ == '__main__':
    main(sys.argv)