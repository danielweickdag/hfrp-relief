"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Ticket,
  Zap,
  Mail,
  Share2,
  Target,
} from "lucide-react";

interface AutomatedEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  ticketsSold: number;
  ticketPrice: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  automationEnabled: boolean;
  socialMediaEnabled: boolean;
  emailRemindersEnabled: boolean;
  goalAmount: number;
  raisedAmount: number;
  milestones: Array<{
    id: string;
    amount: number;
    reached: boolean;
    description: string;
  }>;
}

interface AutomatedEventManagerProps {
  onEventSelect?: (eventId: string, ticketCount: number) => void;
  className?: string;
}

export function AutomatedEventManager({
  onEventSelect,
  className = "",
}: AutomatedEventManagerProps) {
  const [events, setEvents] = useState<AutomatedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    capacity: 100,
    ticketPrice: 25,
    goalAmount: 1000,
    automationEnabled: true,
    socialMediaEnabled: true,
    emailRemindersEnabled: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // For now, we'll use mock data - in production this would fetch from API
      const mockEvents: AutomatedEvent[] = [
        {
          id: "event-1",
          name: "Annual Fundraising Gala",
          description:
            "Join us for an elegant evening of dining and giving back to our community",
          date: "2024-12-15T18:00:00Z",
          location: "Grand Ballroom, Downtown Hotel",
          capacity: 200,
          ticketsSold: 145,
          ticketPrice: 75,
          status: "upcoming",
          automationEnabled: true,
          socialMediaEnabled: true,
          emailRemindersEnabled: true,
          goalAmount: 15000,
          raisedAmount: 10875,
          milestones: [
            {
              id: "m1",
              amount: 5000,
              reached: true,
              description: "Venue booking secured",
            },
            {
              id: "m2",
              amount: 10000,
              reached: true,
              description: "Catering confirmed",
            },
            {
              id: "m3",
              amount: 15000,
              reached: false,
              description: "Full event funding",
            },
          ],
        },
        {
          id: "event-2",
          name: "Community Health Workshop",
          description:
            "Educational workshop on healthcare access and community wellness",
          date: "2024-12-22T14:00:00Z",
          location: "Community Center, Main Street",
          capacity: 50,
          ticketsSold: 28,
          ticketPrice: 15,
          status: "upcoming",
          automationEnabled: true,
          socialMediaEnabled: true,
          emailRemindersEnabled: true,
          goalAmount: 750,
          raisedAmount: 420,
          milestones: [
            {
              id: "m1",
              amount: 250,
              reached: true,
              description: "Materials purchased",
            },
            {
              id: "m2",
              amount: 500,
              reached: false,
              description: "Speaker fees covered",
            },
            {
              id: "m3",
              amount: 750,
              reached: false,
              description: "Full workshop funding",
            },
          ],
        },
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      // In production, this would create the event via API
      const eventId = `event-${Date.now()}`;
      const createdEvent: AutomatedEvent = {
        id: eventId,
        ...newEvent,
        ticketsSold: 0,
        status: "upcoming",
        raisedAmount: 0,
        milestones: [
          {
            id: "m1",
            amount: newEvent.goalAmount * 0.3,
            reached: false,
            description: "Initial setup funding",
          },
          {
            id: "m2",
            amount: newEvent.goalAmount * 0.7,
            reached: false,
            description: "Operational funding",
          },
          {
            id: "m3",
            amount: newEvent.goalAmount,
            reached: false,
            description: "Full event funding",
          },
        ],
      };

      setEvents([...events, createdEvent]);
      setShowCreateForm(false);
      setNewEvent({
        name: "",
        description: "",
        date: "",
        location: "",
        capacity: 100,
        ticketPrice: 25,
        goalAmount: 1000,
        automationEnabled: true,
        socialMediaEnabled: true,
        emailRemindersEnabled: true,
      });

      alert("Event created successfully!");
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event");
    }
  };

  const purchaseTickets = async () => {
    if (!selectedEvent || ticketCount <= 0) {
      alert("Please select an event and valid ticket quantity");
      return;
    }

    const event = events.find((e) => e.id === selectedEvent);
    if (!event) {
      alert("Event not found");
      return;
    }

    if (event.ticketsSold + ticketCount > event.capacity) {
      alert("Not enough tickets available");
      return;
    }

    setProcessingPurchase(true);

    try {
      // In production, this would integrate with Stripe for ticket purchases
      const totalAmount = event.ticketPrice * ticketCount;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update event ticket count
      const updatedEvents = events.map((e) =>
        e.id === selectedEvent
          ? {
              ...e,
              ticketsSold: e.ticketsSold + ticketCount,
              raisedAmount: e.raisedAmount + totalAmount,
            }
          : e,
      );
      setEvents(updatedEvents);

      if (onEventSelect) {
        onEventSelect(selectedEvent, ticketCount);
      }

      alert(
        `Successfully purchased ${ticketCount} ticket(s) for ${event.name}!`,
      );
      setSelectedEvent("");
      setTicketCount(1);
    } catch (error) {
      console.error("Failed to purchase tickets:", error);
      alert("Failed to purchase tickets");
    } finally {
      setProcessingPurchase(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvailableTickets = (event: AutomatedEvent) => {
    return event.capacity - event.ticketsSold;
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading events...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Automated Events</h2>
          <p className="text-gray-600">
            Purchase tickets and support our community events with automated
            impact tracking
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "Create Event"}
        </Button>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Automated Event</CardTitle>
            <CardDescription>
              Set up a new event with automated ticket sales and milestone
              tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  id="event-name"
                  value={newEvent.name}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, name: e.target.value })
                  }
                  placeholder="Enter event name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-date">Date & Time</Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="Describe your event"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                placeholder="Event location"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-capacity">Capacity</Label>
                <Input
                  id="event-capacity"
                  type="number"
                  value={newEvent.capacity}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      capacity: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-price">Ticket Price</Label>
                <Input
                  id="ticket-price"
                  type="number"
                  value={newEvent.ticketPrice}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      ticketPrice: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-amount">Goal Amount</Label>
                <Input
                  id="goal-amount"
                  type="number"
                  value={newEvent.goalAmount}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      goalAmount: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newEvent.automationEnabled}
                  onCheckedChange={(checked) =>
                    setNewEvent({ ...newEvent, automationEnabled: checked })
                  }
                />
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Enable Automation
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newEvent.socialMediaEnabled}
                  onCheckedChange={(checked) =>
                    setNewEvent({ ...newEvent, socialMediaEnabled: checked })
                  }
                />
                <Label className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Social Media
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newEvent.emailRemindersEnabled}
                  onCheckedChange={(checked) =>
                    setNewEvent({ ...newEvent, emailRemindersEnabled: checked })
                  }
                />
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Reminders
                </Label>
              </div>
            </div>

            <Button onClick={createEvent} className="w-full">
              Create Automated Event
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => {
          const availableTickets = getAvailableTickets(event);
          const progressPercentage = getProgressPercentage(
            event.raisedAmount,
            event.goalAmount,
          );
          const isSelected = selectedEvent === event.id;

          return (
            <Card
              key={event.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedEvent(event.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{event.name}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={
                        event.status === "upcoming" ? "default" : "secondary"
                      }
                    >
                      {event.status}
                    </Badge>
                    {event.automationEnabled && (
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(event.ticketPrice)} per ticket
                  </div>
                </div>

                {/* Ticket Availability */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Tickets Available
                    </span>
                    <span className="font-medium">
                      {availableTickets} / {event.capacity}
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((event.capacity - availableTickets) / event.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Fundraising Progress */}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Fundraising Goal
                    </span>
                    <span className="font-medium">
                      {formatCurrency(event.raisedAmount)} /{" "}
                      {formatCurrency(event.goalAmount)}
                    </span>
                  </div>
                  <div className="mt-2 bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {progressPercentage.toFixed(1)}% of goal reached
                  </div>
                </div>

                {/* Automation Features */}
                <div className="flex gap-2 text-xs">
                  {event.socialMediaEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Share2 className="w-3 h-3 mr-1" />
                      Social
                    </Badge>
                  )}
                  {event.emailRemindersEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Mail className="w-3 h-3 mr-1" />
                      Reminders
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ticket Purchase Section */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Purchase Tickets
            </CardTitle>
            <CardDescription>
              Select the number of tickets you'd like to purchase
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {(() => {
              const event = events.find((e) => e.id === selectedEvent);
              if (!event) return null;

              const availableTickets = getAvailableTickets(event);
              const totalCost = event.ticketPrice * ticketCount;

              return (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ticket-count">Number of Tickets</Label>
                    <Input
                      id="ticket-count"
                      type="number"
                      value={ticketCount}
                      onChange={(e) =>
                        setTicketCount(Number.parseInt(e.target.value) || 1)
                      }
                      min="1"
                      max={availableTickets}
                    />
                    <div className="text-sm text-gray-500">
                      {availableTickets} tickets available
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">
                      You're purchasing tickets for:
                    </div>
                    <div className="font-medium">{event.name}</div>
                    <div className="text-lg font-bold text-green-600 mt-1">
                      {formatCurrency(totalCost)} ({ticketCount} ×{" "}
                      {formatCurrency(event.ticketPrice)})
                    </div>
                  </div>

                  <Button
                    onClick={purchaseTickets}
                    disabled={
                      processingPurchase ||
                      ticketCount <= 0 ||
                      ticketCount > availableTickets
                    }
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    {processingPurchase ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Purchase...
                      </>
                    ) : (
                      <>
                        <Ticket className="w-5 h-5 mr-2" />
                        Purchase {ticketCount} Ticket
                        {ticketCount > 1 ? "s" : ""} -{" "}
                        {formatCurrency(totalCost)}
                      </>
                    )}
                  </Button>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
